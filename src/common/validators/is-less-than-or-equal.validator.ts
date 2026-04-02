import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isLessThanOrEqual', async: false })
export class IsLessThanOrEqualConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as Record<string, number>)[relatedPropertyName];

    if (value === undefined || relatedValue === undefined) {
      return true;
    }

    return value <= relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be less than or equal to ${relatedPropertyName}`;
  }
}
