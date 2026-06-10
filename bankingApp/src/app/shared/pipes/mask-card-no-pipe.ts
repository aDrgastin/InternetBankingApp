import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCardNo',
})
export class MaskCardNoPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';
        return `**** **** **** ${value.slice(-4)}`;
    }
}
