import { TestBed } from '@angular/core/testing';

import { Endpoints } from './endpoints';

describe('Endpoints', () => {
  let service: Endpoints;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Endpoints);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
