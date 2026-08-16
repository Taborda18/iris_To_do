import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterPage } from './register';

describe('RegisterPage', () => {
  const setup = (registered = true) => {
    const auth = { loading: signal(false), register: vi.fn().mockResolvedValue(registered) };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    return { fixture: TestBed.createComponent(RegisterPage), auth, router };
  };

  it('rejects invalid and mismatched registration data', async () => {
    const { fixture, auth } = setup();
    fixture.componentInstance.form.patchValue({ fullName: 'A', email: 'invalid', password: 'password', confirmPassword: 'different' });

    await fixture.componentInstance.submit();

    expect(auth.register).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.confirmPassword.touched).toBe(true);
  });

  it('rejects numbers and special characters in the full name', async () => {
    const { fixture, auth } = setup();
    fixture.componentInstance.form.setValue({ fullName: 'Ana-López', email: 'ana@example.com', password: 'password', confirmPassword: 'password' });

    await fixture.componentInstance.submit();

    expect(fixture.componentInstance.form.controls.fullName.hasError('pattern')).toBe(true);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('registers and navigates to tasks', async () => {
    const { fixture, auth, router } = setup();
    fixture.componentInstance.form.setValue({ fullName: 'Ada Lovelace', email: 'ada@example.com', password: 'password', confirmPassword: 'password' });

    await fixture.componentInstance.submit();

    expect(auth.register).toHaveBeenCalledWith({ fullName: 'Ada Lovelace', email: 'ada@example.com', password: 'password' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tasks');
  });

  it('toggles both password fields', () => {
    const { fixture } = setup();
    fixture.componentInstance.togglePassword();
    fixture.componentInstance.toggleConfirmPassword();

    expect(fixture.componentInstance.showPassword()).toBe(true);
    expect(fixture.componentInstance.showConfirmPassword()).toBe(true);
  });
});
