import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string | number | boolean) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = <T extends Record<string, string | number | boolean>>(
  initialData: T,
  validationRules: Record<keyof T, ValidationRule>
) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  const validateField = useCallback((field: keyof T, value: string | number | boolean): string | null => {
    const rule = validationRules[field];
    if (!rule) return null;

    // Required check
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Dit veld is verplicht';
    }

    if (value) {
      // Min length check
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return `Minimaal ${rule.minLength} karakters`;
      }

      // Max length check
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return `Maximaal ${rule.maxLength} karakters`;
      }

      // Pattern check
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return 'Ongeldig formaat';
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value);
      }
    }

    return null;
  }, [validationRules]);

  const validateForm = useCallback((data: T): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field as keyof T, data[field as keyof T]);
      if (error) {
        newErrors[field as string] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, validateField]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => new Set(prev).add(field));
  }, []);

  const getFieldError = useCallback((field: keyof T): string | null => {
    if (!touched.has(field)) return null;
    return errors[field as string] || null;
  }, [errors, touched]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isFieldValid = useCallback((field: keyof T): boolean => {
    return !getFieldError(field);
  }, [getFieldError]);

  const isFormValid = useCallback((data: T): boolean => {
    return validateForm(data);
  }, [validateForm]);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    getFieldError,
    clearErrors,
    isFieldValid,
    isFormValid,
  };
};
