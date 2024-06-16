import { AbstractControl } from '@angular/forms';

interface PasswordErrors {
  missingUpperCase?: boolean;
  missingLowerCase?: boolean;
  missingNumeric?: boolean;
  missingSpecialCharacter?: boolean;
}

export function PasswordStrengthValidator(control: AbstractControl): PasswordErrors | null {
  const password = control.value;
  if (!password) {
    return null;
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumeric = /[0-9]/.test(password);
  const hasSpecialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors: PasswordErrors = {};

  if (!hasUpperCase) {
    errors['missingUpperCase'] = true;
  }

  if (!hasLowerCase) {
    errors['missingLowerCase'] = true;
  }

  if (!hasNumeric) {
    errors['missingNumeric'] = true;
  }

  if (!hasSpecialCharacters) {
    errors['missingSpecialCharacter'] = true;
  }

  return Object.keys(errors).length === 0 ? null : errors;
}
