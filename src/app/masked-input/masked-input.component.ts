import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-masked-input',
  templateUrl: './masked-input.component.html',
  styleUrls: ['./masked-input.component.scss'],
})
export class MaskedInputComponent {
  @ViewChild('maskedInput') maskedInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    const el = this.maskedInput.nativeElement;

    const pattern = el.getAttribute('placeholder') || '',
      slots = new Set(el.dataset['slots'] || '_'),
      prev = ((j) =>
        Array.from(pattern, (c, i) => (slots.has(c) ? (j = i + 1) : j)))(0),
      first = [...pattern].findIndex((c) => slots.has(c)),
      accept = new RegExp(el.dataset['accept'] || '\\d', 'g'),
      clean = (input: string) => {
        const matches = input.match(accept) || [];
        return Array.from(pattern, (c) =>
          matches[0] === c || slots.has(c) ? matches.shift() || c : c
        );
      },
      format = () => {
        const [i, j] = [el.selectionStart, el.selectionEnd].map((i) => {
          i = clean(el.value.slice(0, i || undefined)).findIndex((c) =>
            slots.has(c)
          );
          return i < 0 ? prev.at(-1) : back ? prev[i - 1] || first : i;
        });
        el.value = clean(el.value).join('');
        el.setSelectionRange(i || null, j || null);
        back = false;
      };
    let back = false;
    el.addEventListener('keydown', (e) => (back = e.key === 'Backspace'));
    el.addEventListener('input', format);
    el.addEventListener('focus', format);
    el.addEventListener('blur', () => el.value === pattern && (el.value = ''));
  }
}
