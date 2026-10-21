import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('empieza en el paso del correo', () => {
    expect(component.step).toBe(1);
  });

  it('no envía el código si el correo no es válido', () => {
    component.emailForm.setValue({ email: 'no-es-correo' });
    component.sendCode();
    expect(component.step).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('detecta contraseñas que no coinciden', () => {
    component.resetForm.setValue({ code: '123456', password: 'abcdef', confirmPassword: 'otra123' });
    expect(component.resetForm.hasError('notMatching')).toBeTrue();
  });
});
