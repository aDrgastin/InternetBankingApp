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
    editedUser: User = { ...this.user() ?? { id: 0, pin: '', username: '', firstName: '', lastName: '', email: '', role: 'USER', createdAt: new Date } };
    passwordChange = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
    showPasswordSection: boolean = false;
    protected pinVisible = false;
    protected errorMsg = signal('');

    toggleEditMode() {
        if (this.editMode) {
            // Cancel edit - reset changes
            this.editedUser = { ...this.user() ?? { id: 0, pin: '', username: '', firstName: '', lastName: '', email: '', role: 'USER', createdAt: new Date } };
        }
        this.editMode = !this.editMode;
    }

    saveProfile() {
        console.log('Saving profile:', this.editedUser);
        this.authService.updateUser(this.editedUser).subscribe({
            next: () => {
                // Show success message
                alert('Profile updated successfully!');
                this.editMode = false;
            },
            error: (err: Error) => {
                // Show failed message
                alert(`Failed to update profile!\n${err.message}`);
                this.errorMsg.set(err.message);
                this.editMode = false;
                console.error('Error while updating profile:', err);
            }
        });
    }

    togglePasswordSection() {
        this.showPasswordSection = !this.showPasswordSection;
        if (!this.showPasswordSection) {
            this.resetPasswordForm();
        }
    }

    changePassword() {
        if (this.passwordChange.newPassword !== this.passwordChange.confirmPassword) {
            this.errorMsg.set('Passwords do not match');
            return;
        }
        // TODO: Change password via API
        console.log('Changing password');
        alert('Password changed successfully!');
        this.resetPasswordForm();
        this.showPasswordSection = false;
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
