import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'txDirection',
})
export class TxDirectionPipe implements PipeTransform {
    transform(amount: string | null, direction: 'CREDIT' | 'DEBIT'): string {
        const sign = direction === 'CREDIT' ? '+' : '-';
        return `${sign}${amount}`;
    }
}
