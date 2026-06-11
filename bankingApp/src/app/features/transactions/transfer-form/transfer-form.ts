import { Component, inject, output, signal } from '@angular/core';
import { AccountService } from '../../../core/services/account-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction-service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-transfer-form',
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './transfer-form.html',
  styleUrl: './transfer-form.css',
})
export class TransferForm {
    private readonly accountService = inject(AccountService);
    private readonly transactionService = inject(TransactionService);

    readonly success = output<void>();
    accounts = this.accountService.accounts;
    protected transferForm = new FormGroup({
        fromAccId: new FormControl<number | null>(null, { validators: Validators.required }),
        toIban: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^HR\d{19}$/)] }),
        amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
        description: new FormControl<string | null>(null),
    });
    protected loading = signal(false);
    protected errorMsg = signal('');

    protected onSubmit() {
        if (this.transferForm.invalid) return;
        this.errorMsg.set('');
        this.loading.set(true);
        const { fromAccId, toIban, amount, description } = this.transferForm.getRawValue();
        this.transactionService.transferFunds(+fromAccId!, toIban, +amount!, description).subscribe({
            next: () => {
                this.success.emit();
                this.loading.set(false);
            },
            error: (err: Error) => {
                console.error('Error while transfering funds:', err);
                this.errorMsg.set(err.message);
                this.loading.set(false);
            }
        });
    }

    protected checkValidity(controlName: string) {
        const control = this.transferForm.get(controlName);
        if (!control) return false;
        return (control.touched || control.dirty) && control.invalid;
    }
}
