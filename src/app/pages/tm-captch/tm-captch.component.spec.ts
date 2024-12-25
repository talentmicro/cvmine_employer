import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmCaptchComponent } from './tm-captch.component';

describe('TmCaptchComponent', () => {
  let component: TmCaptchComponent;
  let fixture: ComponentFixture<TmCaptchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmCaptchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmCaptchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
