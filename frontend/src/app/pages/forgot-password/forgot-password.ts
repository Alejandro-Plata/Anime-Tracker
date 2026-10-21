import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  authService = inject(AuthService);
  router = inject(Router);

  // 1 = pedir el código por correo, 2 = escribir el código y la nueva contraseña
  step: 1 | 2 = 1;
  isLoading = false;
  errorMessage = '';
  infoMessage = '';
  done = false;

  emailForm: FormGroup;
  resetForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  sendCode() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.emailForm.value.email).then(() => {
      this.isLoading = false;
      this.step = 2;
      // El backend responde igual exista o no el correo, así que el mensaje también es neutro
      this.infoMessage = 'Si el correo está registrado, te hemos enviado un código de 6 dígitos. Caduca en 15 minutos.';
    }).catch((err: Error) => {
      this.isLoading = false;
      this.errorMessage = err.message;
    });
  }

  resetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const { code, password } = this.resetForm.value;
    this.authService.resetPassword(this.emailForm.value.email, code, password).then(() => {
      this.isLoading = false;
      this.done = true;
      // Dejamos ver el mensaje un momento y mandamos al login
      setTimeout(() => this.router.navigate(['/login']), 2500);
    }).catch((err: Error) => {
      this.isLoading = false;
      this.errorMessage = err.message;
    });
  }

  // Volver al paso 1 por si se equivocó de correo o quiere pedir otro código
  back() {
    this.step = 1;
    this.errorMessage = '';
    this.infoMessage = '';
    this.resetForm.reset();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { notMatching: true };
  }
}
