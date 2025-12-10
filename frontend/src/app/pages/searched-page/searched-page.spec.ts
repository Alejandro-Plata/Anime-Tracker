import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchedPage } from './searched-page';

describe('SearchedPage', () => {
  let component: SearchedPage;
  let fixture: ComponentFixture<SearchedPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchedPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
