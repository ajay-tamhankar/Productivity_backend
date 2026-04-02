import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint for Render and uptime monitors' })
  getHealth() {
    return {
      status: 'ok',
      service: 'production-shift-monitoring-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
