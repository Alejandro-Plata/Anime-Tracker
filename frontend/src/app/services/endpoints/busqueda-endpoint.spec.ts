import { TestBed } from '@angular/core/testing';

import { BusquedaEndpoint } from './busqueda-endpoint';

describe('BusquedaEndpoint', () => {
  let service: BusquedaEndpoint;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusquedaEndpoint);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
