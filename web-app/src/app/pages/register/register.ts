import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import type { RegisterCredentials } from '../../models/auth/auth.model';

type RegisterForm = FormGroup<{
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

const normalizeFullName = (value: string): string => value
  .normalize('NFC')
  .replace(/[\u200B-\u200D\uFEFF]/gu, '')
  .replace(/\s+/gu, ' ')
  .trim();

const fullNameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  const value = normalizeFullName(String(control.value));
  return /^\p{L}+(?: +\p{L}+)*$/u.test(value) ? null : { pattern: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = this.authService.loading;
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly form: RegisterForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100), fullNameValidator] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  togglePassword(): void { this.showPassword.update((visible) => !visible); }
  toggleConfirmPassword(): void { this.showConfirmPassword.update((visible) => !visible); }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.controls.password.value !== this.form.controls.confirmPassword.value) return;

    const { fullName, email, password } = this.form.getRawValue();
    const credentials: RegisterCredentials = { fullName: normalizeFullName(fullName), email, password };
    const registered = await this.authService.register(credentials);
    if (registered) await this.router.navigateByUrl('/tasks');
  }
}
