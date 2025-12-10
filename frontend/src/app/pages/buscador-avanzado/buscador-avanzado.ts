import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-buscador-avanzado',
  imports: [ReactiveFormsModule],
  templateUrl: './buscador-avanzado.html',
  styleUrl: './buscador-avanzado.css',
})
export class BuscadorAvanzado {
  scoreControl = new FormControl<number>(5, { nonNullable: true });

  get score(): number {
    return this.scoreControl.value;
  }
}
