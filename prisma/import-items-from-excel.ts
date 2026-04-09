import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as XLSX from 'xlsx';

type ExcelItemRow = Record<string, unknown>;

const REQUIRED_COLUMNS = ['STL Part No.', 'Description', 'Finish Wt'] as const;
const UPSERT_RETRIES = 5;

const prisma = new PrismaClient();

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).replace(/\u00a0/g, ' ').trim();
}

function parseFinishWeight(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalized = String(value).replace(/,/g, '').trim();
  const weight = Number(normalized);

  if (!Number.isFinite(weight) || weight <= 0) {
    return null;
  }

  return Number(weight.toFixed(3));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientConnectionError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes('server has closed the connection') ||
    message.includes("can't reach database server") ||
    message.includes('connection') ||
    message.includes('timed out')
  );
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error(
      'Missing Excel path. Usage: npm run import:items -- "<path-to-item.xlsx>"',
    );
  }

  const resolvedPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Excel file not found: ${resolvedPath}`);
  }

  const workbook = XLSX.readFile(resolvedPath);
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('Excel workbook has no sheets');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<ExcelItemRow>(sheet, { defval: null });

  if (rows.length === 0) {
    throw new Error(`No data rows found in sheet "${firstSheetName}"`);
  }

  const discoveredHeaders = new Set(
    rows.flatMap((row) => Object.keys(row).map((header) => header.trim())),
  );
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !discoveredHeaders.has(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns: ${missingColumns.join(', ')} in sheet "${firstSheetName}"`,
    );
  }

  const skippedRows: string[] = [];
  const preparedRows: Array<{
    itemCode: string;
    description: string;
    finishWeight: number;
  }> = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const itemCode = normalizeText(row['STL Part No.']);
    const description = normalizeText(row.Description);
    const finishWeight = parseFinishWeight(row['Finish Wt']);

    const isCompletelyEmpty =
      itemCode === '' && description === '' && row['Finish Wt'] === null;

    if (isCompletelyEmpty) {
      return;
    }

    if (!itemCode) {
      skippedRows.push(`Row ${rowNumber}: STL Part No. is empty`);
      return;
    }

    if (!description) {
      skippedRows.push(`Row ${rowNumber}: Description is empty`);
      return;
    }

    if (finishWeight === null) {
      skippedRows.push(
        `Row ${rowNumber}: Finish Wt must be a positive number`,
      );
      return;
    }

    preparedRows.push({ itemCode, description, finishWeight });
  });

  if (preparedRows.length === 0) {
    throw new Error('No valid rows found to import');
  }

  const uniqueItemCodes = [...new Set(preparedRows.map((row) => row.itemCode))];
  const existingItems = await prisma.item.findMany({
    where: {
      itemCode: {
        in: uniqueItemCodes,
      },
    },
    select: {
      itemCode: true,
    },
  });
  const existingItemCodes = new Set(existingItems.map((item) => item.itemCode));

  let createdCount = 0;
  let updatedCount = 0;
  let processedCount = 0;

  for (const row of preparedRows) {
    const wasExisting = existingItemCodes.has(row.itemCode);
    let succeeded = false;

    for (let attempt = 1; attempt <= UPSERT_RETRIES; attempt += 1) {
      try {
        await prisma.item.upsert({
          where: { itemCode: row.itemCode },
          update: {
            description: row.description,
            finishWeight: row.finishWeight,
          },
          create: row,
        });
        succeeded = true;
        break;
      } catch (error) {
        if (!isTransientConnectionError(error) || attempt === UPSERT_RETRIES) {
          throw error;
        }

        console.warn(
          `Transient DB error on itemCode=${row.itemCode}. Retry ${attempt}/${UPSERT_RETRIES}...`,
        );
        await prisma.$disconnect().catch(() => undefined);
        await sleep(attempt * 500);
      }
    }

    if (!succeeded) {
      throw new Error(`Failed to upsert itemCode=${row.itemCode}`);
    }

    if (wasExisting) {
      updatedCount += 1;
    } else {
      createdCount += 1;
      existingItemCodes.add(row.itemCode);
    }

    processedCount += 1;
    if (processedCount % 100 === 0) {
      console.log(`Progress: ${processedCount}/${preparedRows.length}`);
    }
  }

  console.log(`Imported sheet: ${firstSheetName}`);
  console.log(`Source file: ${resolvedPath}`);
  console.log(`Processed rows: ${preparedRows.length}`);
  console.log(`Created items: ${createdCount}`);
  console.log(`Updated items: ${updatedCount}`);
  if (skippedRows.length > 0) {
    console.log(`Skipped rows: ${skippedRows.length}`);
    console.log(skippedRows.slice(0, 20).join('\n'));
    if (skippedRows.length > 20) {
      console.log(`...and ${skippedRows.length - 20} more`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
