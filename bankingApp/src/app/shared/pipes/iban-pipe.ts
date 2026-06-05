import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iban',
})
export class IbanPipe implements PipeTransform {
    transform(iban: string | null): string {
        return iban ? iban.replace(/(.{4})/g, '$1 ').trim(): '-';
    }
}
