import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[number]',
})
export class NumberDirective {
  @Output() ngModelChange = new EventEmitter();
  regExpNumber: string;

  constructor(readonly el: ElementRef) {
    this.regExpNumber =  '[^0-9]';
  }

  @HostListener('input', ['$event.target.value'])
  input(value: any) {
    value = value.toString();
    value = value.trimLeft();
    value = value.replace(/  +/g, ' ');
    this.el.nativeElement['value'] = value.replace(new RegExp(this.regExpNumber, 'g'), '');
    this.ngModelChange.emit(this.el.nativeElement['value']);
  }
}
