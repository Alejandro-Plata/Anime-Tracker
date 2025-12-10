import { TestBed } from '@angular/core/testing';

import { EndpointBusquedaAvanzada } from './endpoint-busqueda-avanzada';

describe('EndpointBusquedaAvanzada', () => {
  let service: EndpointBusquedaAvanzada;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointBusquedaAvanzada);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
