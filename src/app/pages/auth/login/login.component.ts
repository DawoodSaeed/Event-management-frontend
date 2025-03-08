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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private matchPassword = inject(MatchPassword);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  authForm = new FormGroup({
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
  });

  onSignin() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.toastr.error('Please fix the errors in the form.', 'Form Error');
      return;
    }

    const { email, password } = this.authForm.value;

    if (email && password) {
      this.authService.login({ email, password }).subscribe({
        next: (res) => {
          this.authService.storeToken(res.token);
          this.authService.storeUser(res);
          this.toastr.success('Login Was successful', 'Success');
          this.router.navigate([`${res.role}/dashboard`]);
        },
        error: (err) => {
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
