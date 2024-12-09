import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantDetailsPageComponent } from './applicant-details-page.component';

describe('ApplicantDetailsPageComponent', () => {
  let component: ApplicantDetailsPageComponent;
  let fixture: ComponentFixture<ApplicantDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantDetailsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
