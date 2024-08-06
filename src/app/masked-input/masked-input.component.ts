import { Component, ElementRef, ViewChild } from '@angular/core';

const DEFAULT_ACCEPTED_INPUT = '\\d';

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
      isSlotChar = (char: string) => slots.has(char),
      prev = ((cursorIdx) => {
        return Array.from(pattern, (char, i) =>
          isSlotChar(char) ? (cursorIdx = i + 1) : cursorIdx
        );
      })(0),
      first = [...pattern].findIndex((c) => slots.has(c)),
      acceptedCharRegex = new RegExp(
        el.dataset['accept'] || DEFAULT_ACCEPTED_INPUT,
        'g'
      ),
      getCleanedInputChars = (input: string) => {
        const matchedInputChars = input.match(acceptedCharRegex) || [];

        return Array.from(pattern, function mapChar(patternChar) {
          return matchedInputChars[0] === patternChar || isSlotChar(patternChar)
            ? matchedInputChars.shift() || patternChar
            : patternChar;
        });
      },
      format = () => {
        const [i, j] = [el.selectionStart, el.selectionEnd].map((cursorPos) => {
          cursorPos = getCleanedInputChars(
            el.value.slice(0, cursorPos || undefined)
          ).findIndex((c) => isSlotChar(c));

          const isNonSlotChar = cursorPos < 0;

          return isNonSlotChar
            ? prev.at(-1)
            : isBackspace
            ? prev[cursorPos - 1] || first
            : cursorPos;
        });
        el.value = getCleanedInputChars(el.value).join('');
        el.setSelectionRange(i || null, j || null);
        isBackspace = false;
      };

    let isBackspace = false;

    const setIsBackspace = (e: { key: string }) =>
      (isBackspace = e.key === 'Backspace');

    el.addEventListener('keydown', setIsBackspace);

    el.addEventListener('input', format);
    el.addEventListener('focus', format);

    el.addEventListener('blur', function onBlur() {
      if (el.value === pattern) {
        el.value = '';
      }
    });
  }
}
