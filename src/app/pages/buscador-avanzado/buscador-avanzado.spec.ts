import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorAvanzado } from './buscador-avanzado';

describe('BuscadorAvanzado', () => {
  let component: BuscadorAvanzado;
  let fixture: ComponentFixture<BuscadorAvanzado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorAvanzado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorAvanzado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
