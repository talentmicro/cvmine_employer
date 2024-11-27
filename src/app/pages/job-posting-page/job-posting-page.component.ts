import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { jobListings } from '../job-listings-page/job-listings';
import { jobTypes, jobLocations, period, noticePeriods, experienceLevels, currencies } from './data';

@Component({
    selector: 'app-job-posting-page',
    templateUrl: './job-posting-page.component.html',
    styleUrl: './job-posting-page.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        NavbarComponent,
        FooterComponent,
        BackToTopComponent,
        ReactiveFormsModule,
        FormsModule,
        MatCheckboxModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatRadioModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatOptionModule,
        MatDividerModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobPostingPageComponent {
    firstStepForm: FormGroup;
    secondStepForm: FormGroup;
    editMode: boolean = false;
    currentStep: number = 0;

    jobsList: Array<{ job_code: string; job_name: string }> = [];
    jobTypes: string[] = [];
    period: string[] = [];
    jobLocations: string[] = [];
    noticePeriods: string[] = [];
    currencies: string[] = [];
    experienceLevels: string[] = [];

    selectedLocations: string[] = [];
    readonly reactiveKeywords = signal(['angular', 'how-to', 'tutorial', 'accessibility']);
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    announcer = inject(LiveAnnouncer);

    constructor(private fb: FormBuilder, private route: ActivatedRoute) {
        this.firstStepForm = this.fb.group({
            fetchExisting: ['no'],
            existingJob: [''],
            jobTitle: ['', Validators.required],
            jobDescription: ['', Validators.required],
        });
        this.secondStepForm = this.fb.group({
            jobType: [[], Validators.required],
            jobLocation: [[], Validators.required],
            skills: [[], Validators.required],
            experience: ['', Validators.required],
            salaryRange: ['', Validators.required],
            currency: ['', Validators.required],
            period: ['', Validators.required],
            noticePeriod: ['', Validators.required],
        });

        // this.setupValueSync();
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.editMode = !!params['id'];
            if (this.editMode) {
                this.loadJobDetails(params['id']);
                this.removeAddSpecificControls();
            }
            this.jobTypes = jobTypes;
            this.jobLocations = jobLocations;
            this.experienceLevels = experienceLevels;
            this.noticePeriods = noticePeriods;
            this.period = period;
            this.currencies = currencies;
        });
    }

    private removeAddSpecificControls(): void {
        this.firstStepForm.removeControl('fetchExisting');
        this.firstStepForm.removeControl('existingJob');
    }

    private loadJobDetails(id: string): void {
        const mockJob = {
            title: 'Software Developer',
            description: 'Build and maintain high-quality applications.',
        };
      
        this.firstStepForm.patchValue({
            jobTitle: mockJob.title,
            jobDescription: mockJob.description,
        });
    }

    private setupValueSync(): void {
        this.firstStepForm.get('existingJob')?.valueChanges.subscribe((selectedJob) => {
            if (this.firstStepForm.get('fetchExisting')?.value === 'yes') {
                const jobDetails = this.getJobDetails(selectedJob);
                this.firstStepForm.patchValue({
                    jobTitle: jobDetails?.title || '',
                    jobDescription: jobDetails?.description || '',
                });
            }
        });
    }

    private getJobDetails(jobName: string): { title: string; description: string } | null {
        const mockJobs: Record<string, { title: string; description: string }> = {
            Developer: { title: 'Software Developer', description: 'Build and maintain applications.' },
            Designer: { title: 'UI/UX Designer', description: 'Design user-friendly interfaces.' },
            'Project Manager': { title: 'Project Manager', description: 'Lead and manage projects.' },
        };
        return mockJobs[jobName] || null;
    }
    
    removeLocation(location: string): void {
        const index = this.selectedLocations.indexOf(location);
        if (index >= 0) {
            this.selectedLocations.splice(index, 1);
        }
    }

    removeReactiveKeyword(keyword: string) {
        this.reactiveKeywords.update(keywords => {
          const index = keywords.indexOf(keyword);
          if (index < 0) {
            return keywords;
          }
    
          keywords.splice(index, 1);
          this.announcer.announce(`removed ${keyword} from reactive form`);
          return [...keywords];
        });
      }
    
      addReactiveKeyword(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
    
        // Add our keyword
        if (value) {
          this.reactiveKeywords.update(keywords => [...keywords, value]);
          this.announcer.announce(`added ${value} to reactive form`);
        }
    
        // Clear the input value
        event.chipInput!.clear();
    }

}
