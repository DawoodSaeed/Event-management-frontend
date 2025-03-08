import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { MatchPassword } from '../validators/match-password';
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [
    CardModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    FormsModule,
    RouterLink,
  ],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private matchPassword = inject(MatchPassword);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  authForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.minLength(4),
        Validators.maxLength(50),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: [this.matchPassword.validate()] }
  );

  onSignup() {
    if (this.authForm.invalid) {
      // Mark all fields as touched to display validation messages
      this.authForm.markAllAsTouched();
      this.toastr.error('Please fix the errors in the form.', 'Form Error');
      return;
    }

    const { name, email, password } = this.authForm.value;

    if (name && email && password) {
      this.authService.register({ name, email, password }).subscribe({
        next: () => {
          this.toastr.success(
            'Registration successful! Check your email for verification.',
            'Success'
          );
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // Display server error message
          this.toastr.error(
            err.error.message || 'An error occurred during registration.',
            'Error'
          );
        },
      });
    } else {
      this.toastr.error('please fill in all the fields');
    }
  }
}
