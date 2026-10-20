import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutside {

  // Emite cuando se hace click fuera del elemento que tiene la directiva
  @Output() clickOutside = new EventEmitter<void>();

  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }
}
