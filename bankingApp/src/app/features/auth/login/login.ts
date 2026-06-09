import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
    private authService = inject(AuthService);
    private router = inject(Router);

    protected credentials: { username: string, password: string } = { username: '', password: '' };
    protected loading = signal(false);
    protected errorMsg = signal('');

    protected onSubmit() {
        this.loading.set(true);
        this.authService.login(this.credentials.username, this.credentials.password).subscribe({
            next: () => {
                this.router.navigate(['dashboard'])
                this.loading.set(false);
            },
            error: (err: Error) => {
                this.errorMsg.set(err.message);
                console.error('Error while logging in:', err.cause);
                this.loading.set(false);
            }
        });
    }
}
