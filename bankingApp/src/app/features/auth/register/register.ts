import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected registerForm = new FormGroup({
        firstName : new FormControl('', { nonNullable: true, validators: Validators.required }),
        lastName : new FormControl('', { nonNullable: true, validators: Validators.required }),
        pin : new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{11}$/)] }),
        username : new FormControl('', { nonNullable: true, validators: Validators.required }),
        password : new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] }),
        repeatPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
        email : new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
    }, { validators: this.passwordsMatch });
    protected errorMsg = signal('');

    protected onSubmit() {
        if (this.registerForm.invalid) return;
        const { firstName, lastName, pin, username, password, email } = this.registerForm.getRawValue();
        this.authService.register(pin, username, password, firstName, lastName, email).subscribe({
            next: () => this.router.navigate(['dashboard']),
            error: (err: Error) => {
                this.errorMsg.set(err.message);
                console.error('Error while registering:', err.cause);
            }
        });
    }

    protected checkValidity(controlName: string, groupError?: string) {
        const control = this.registerForm.get(controlName);
        const isTouchedOrDirty = control?.touched || control?.dirty;
        const hasGroupError = groupError ? this.registerForm.hasError(groupError) : false;
        return isTouchedOrDirty && (control?.invalid || hasGroupError);
    }

    private passwordsMatch(group: AbstractControl) {
        const p = group.get('password')?.value;
        const rp = group.get('repeatPassword')?.value;
        return p === rp ? null : { passwordMismatch: true };
    }
}
