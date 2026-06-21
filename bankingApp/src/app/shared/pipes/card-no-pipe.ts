import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardNo',
})
export class CardNoPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';
        return value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') ?? value;
    }
}
