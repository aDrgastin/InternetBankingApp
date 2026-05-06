import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
    private authService = inject(AuthService);
    private router = inject(Router);

    protected credentials: { username: string, password: string } = { username: '', password: '' };
    protected errorMsg = signal('');

    protected onSubmit() {
        this.authService.login(this.credentials.username, this.credentials.password).subscribe({
            next: () => this.router.navigate(['dashboard']),
            error: (err: Error) => {
                this.errorMsg.set(err.message);
                console.error('Error while logging in:', err.cause);
            }
        });
    }
}
