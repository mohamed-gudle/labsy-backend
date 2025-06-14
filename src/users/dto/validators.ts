import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidLanguage(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidLanguage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && ['ar', 'en'].includes(value);
        },
        defaultMessage() {
          return 'Language must be either "ar" (Arabic) or "en" (English)';
        },
      },
    });
  };
}

export function IsValidSpecialty(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidSpecialty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) return false;

          const validSpecialties = [
            'apparel',
            'home-decor',
            'accessories',
            'digital-art',
            'stationery',
            'bags',
            'phone-cases',
            'mugs',
            'posters',
            'canvas',
            'jewelry',
            'electronics',
            'custom-gifts',
          ];

          return value.every(
            (specialty) =>
              typeof specialty === 'string' &&
              validSpecialties.includes(specialty),
          );
        },
        defaultMessage() {
          return 'All specialties must be from the allowed list: apparel, home-decor, accessories, digital-art, stationery, bags, phone-cases, mugs, posters, canvas, jewelry, electronics, custom-gifts';
        },
      },
    });
  };
}

export function IsValidBusinessName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidBusinessName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // Business name should not contain only special characters
          const hasLettersOrNumbers = /[a-zA-Z0-9\u0600-\u06FF]/.test(value);

          // Should not start or end with spaces
          const trimmedValue = value.trim();

          // Should not contain excessive special characters
          const specialCharCount = (
            value.match(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g) || []
          ).length;
          const maxSpecialChars = Math.floor(value.length * 0.2); // Max 20% special chars

          return (
            hasLettersOrNumbers &&
            value === trimmedValue &&
            specialCharCount <= maxSpecialChars
          );
        },
        defaultMessage() {
          return 'Business name must contain letters or numbers, cannot start/end with spaces, and cannot have excessive special characters';
        },
      },
    });
  };
}

export function IsValidSocialMediaUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidSocialMediaUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Optional field
          if (typeof value !== 'string') return false;

          const property = args.property;
          const urlPatterns = {
            instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
            twitter:
              /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
            tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/,
            youtube:
              /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?[a-zA-Z0-9._-]+\/?$/,
            website: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/,
          };

          // Extract platform from property name or parent object
          const platform = property;
          if (args.object && typeof args.object === 'object') {
            // If this is part of a nested object, we need different validation
            return /^https?:\/\/[^\s]+$/.test(value);
          }

          const pattern = urlPatterns[platform as keyof typeof urlPatterns];
          return pattern
            ? pattern.test(value)
            : /^https?:\/\/[^\s]+$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid URL for the respective social media platform`;
        },
      },
    });
  };
}
