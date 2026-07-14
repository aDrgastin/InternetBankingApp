import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth-service';
import { User } from '../../core/models/user';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
    private readonly authService = inject(AuthService);

    protected user = this.authService.user;
    protected editMode: boolean = false;
    protected editedUser: User = { ...this.user() ?? { id: 0, pin: '', username: '', firstName: '', lastName: '', email: '', role: 'USER', createdAt: new Date } };
    protected passwordChange = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
    protected passwordVisible = signal(false);
    protected confirmPasswordVisible = signal(false);
    protected showPasswordSection = signal(false);
    protected pinVisible = signal(false);
    protected errorMsg = signal('');

    toggleEditMode() {
        if (this.editMode) {
            this.editedUser = { ...this.user() ?? { id: 0, pin: '', username: '', firstName: '', lastName: '', email: '', role: 'USER', createdAt: new Date } };
        }
        this.editMode = !this.editMode;
    }

    saveProfile() {
        console.log('Saving profile:', this.editedUser);
        this.authService.updateUser(this.editedUser).subscribe({
            next: () => {
                alert('Profile updated successfully!');
                this.editMode = false;
            },
            error: (err: Error) => {
                alert(`Failed to update profile!\n${err.message}`);
                this.errorMsg.set(err.message);
                this.editMode = false;
                console.error('Error while updating profile:', err.cause);
            }
        });
    }

    togglePasswordSection() {
        this.showPasswordSection.set(!this.showPasswordSection());
        if (!this.showPasswordSection()) {
            this.resetPasswordForm();
        }
    }

    changePassword() {
        if (this.passwordChange.newPassword !== this.passwordChange.confirmPassword) {
            this.errorMsg.set('Passwords do not match');
            return;
        }
        this.authService.changePassword(this.user()?.id ?? 0, this.passwordChange.currentPassword, this.passwordChange.newPassword).subscribe({
            next: () => {
                this.resetPasswordForm();
                this.showPasswordSection.set(false);
                alert('Password changed successfully!');
            },
            error: (err: Error) => {
                console.error('Error while changing password:', err.cause);
                this.errorMsg.set(err.message);
            }
        });
    }

    resetPasswordForm() {
        this.errorMsg.set('');
        this.passwordChange = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    }

    getRoleBadgeClass(): string {
        const roleMap: { [key: string]: string } = {
            'ADMIN': 'bg-danger',
            'MOD': 'bg-warning',
            'USER': 'bg-primary'
        };
        return roleMap[this.user()?.role ?? 'USER'] || 'bg-secondary';
    }
}
