import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MatchPassword {
  validate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const { password, confirmPassword } = control.value;
      if (password === confirmPassword) {
        return null;
      }
      return { passwordDontMatch: true };
    };
  }
}
