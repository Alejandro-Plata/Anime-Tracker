import { Component, HostListener, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import type { UserProfile } from '../../types/user';
import type { ToastState } from '../../types/toastState';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  profile: UserProfile | null = null;
  isLoading = true;
  loadError = '';

  stats = { total: 0, viendo: 0, finalizado: 0, pendiente: 0, abandonado: 0, media: 0 };

  savingProfile = false;
  savingPassword = false;
  deleting = false;
  confirmingDelete = false;

  // Errores que devuelve el servidor, mostrados junto a cada formulario
  profileError = '';
  passwordError = '';
  deleteError = '';

  profileForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: Perfil.passwordsMatch });

  deleteForm = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  toastState: ToastState = { show: false, type: 'like', title: '', message: '' };
  toastKey = 0;
  private toastTimeout?: ReturnType<typeof setTimeout>;

  static passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const { newPassword, confirmPassword } = control.value;
    return newPassword === confirmPassword ? null : { notMatching: true };
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.isLoading = true;
    this.loadError = '';
    try {
      const [profile, favorites] = await Promise.all([
        this.authService.getProfile(),
        this.authService.getFavorites(),
      ]);
      this.setProfile(profile);

      const rated = favorites.filter(f => f.score > 0);
      this.stats = {
        total: favorites.length,
        viendo: favorites.filter(f => f.state === 'VIENDO').length,
        finalizado: favorites.filter(f => f.state === 'FINALIZADO').length,
        pendiente: favorites.filter(f => f.state === 'PENDIENTE').length,
        abandonado: favorites.filter(f => f.state === 'ABANDONADO').length,
        media: rated.length ? rated.reduce((sum, f) => sum + f.score, 0) / rated.length : 0,
      };
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : 'No se pudo cargar el perfil';
    } finally {
      this.isLoading = false;
    }
  }

  private setProfile(profile: UserProfile) {
    this.profile = profile;
    this.profileForm.reset({ username: profile.username, email: profile.email });
  }

  get initial(): string {
    return (this.profile?.username.charAt(0) || '?').toUpperCase();
  }

  get memberSince(): string {
    return this.profile
      ? new Date(this.profile.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
      : '';
  }

  // Avisa si se intenta cerrar la pestaña con cambios sin guardar
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.profileForm.dirty) event.preventDefault();
  }

  invalid(form: { get(name: string): AbstractControl | null }, name: string): boolean {
    const control = form.get(name);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.savingProfile = true;
    this.profileError = '';
    try {
      this.setProfile(await this.authService.updateProfile(this.profileForm.getRawValue()));
      this.showToast('like', 'Perfil actualizado', 'Tus datos se han guardado.');
    } catch (error) {
      this.profileError = error instanceof Error ? error.message : 'No se pudo guardar el perfil';
    } finally {
      this.savingProfile = false;
    }
  }

  async savePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword = true;
    this.passwordError = '';
    try {
      const { currentPassword, newPassword } = this.passwordForm.getRawValue();
      await this.authService.changePassword(currentPassword, newPassword);
      this.passwordForm.reset();
      this.showToast('like', 'Contraseña cambiada', 'Úsala la próxima vez que inicies sesión.');
    } catch (error) {
      this.passwordError = error instanceof Error ? error.message : 'No se pudo cambiar la contraseña';
    } finally {
      this.savingPassword = false;
    }
  }

  async deleteAccount() {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }
    this.deleting = true;
    this.deleteError = '';
    try {
      await this.authService.deleteAccount(this.deleteForm.getRawValue().password);
      this.profileForm.markAsPristine();
      await this.router.navigate(['/']);
    } catch (error) {
      this.deleteError = error instanceof Error ? error.message : 'No se pudo eliminar la cuenta';
      this.deleting = false;
    }
  }

  cancelDelete() {
    this.confirmingDelete = false;
    this.deleteForm.reset();
    this.deleteError = '';
  }

  private showToast(type: ToastState['type'], title: string, message: string) {
    clearTimeout(this.toastTimeout);
    this.toastKey++;
    this.toastState = { show: true, type, title, message };
    this.toastTimeout = setTimeout(() => (this.toastState.show = false), 2500);
  }
}
