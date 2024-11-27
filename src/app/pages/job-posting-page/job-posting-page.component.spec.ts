import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostingPageComponent } from './job-posting-page.component';

describe('JobPostingPageComponent', () => {
  let component: JobPostingPageComponent;
  let fixture: ComponentFixture<JobPostingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPostingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobPostingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
