import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeDetailPage } from './anime-detail';

describe('AnimeDetailPage', () => {
  let component: AnimeDetailPage;
  let fixture: ComponentFixture<AnimeDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimeDetailPage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AnimeDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
