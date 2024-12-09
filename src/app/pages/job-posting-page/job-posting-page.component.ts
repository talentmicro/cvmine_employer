import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jobListings } from '../job-listings-page/job-listings';
import { currencyList, countryList, noticePeriods, durationList, experienceLevels, jobTypeList, skillsList } from '../data';
import { ImportsModule } from '../../imports';
import { ApiService } from '../services/api.service';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { MultiSelectFilterOptions } from 'primeng/multiselect';

interface Job {
    id: number;
    job_code: string;
    job_name: string;
    total_applications: number;
    shortlisted_applications: number;
    interviewed_applications: number;
    offered_applications: number;
    hired_applications: number;
    dropped_applications: number;
    published_date: string;
    status: string;
}

@Component({
    selector: 'app-job-posting-page',
    templateUrl: './job-posting-page.component.html',
    styleUrl: './job-posting-page.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ImportsModule
    ],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobPostingPageComponent {
    firstStepForm: FormGroup;
    secondStepForm: FormGroup;
    thirdStepForm: FormGroup;
    editMode: boolean = false;
    existing: any[] = [
        { name: 'Yes', key: 'yes' },
        { name: 'No', key: 'no' },
    ];
    selectedExistingJobDetails: any = {};
    // jobsList: Array<{ job_code: number; job_name: string }> = [];
    jobsList: Array<Job> = [];
    filteredJobsList: Array<{ job_code: number; job_name: string }> = [];
    jobTypes: any[] = [];
    period: any[] = [];
    jobLocations: any[] = [];
    // selectedCountries!: any[];
    // filterCountryValue = '';
    noticePeriods: any[] = [];
    currencies: any[] = [];
    experienceLevels: any[] = [];
    selectedLocations: any[] = [];
    defaultSelectedJobTypes = [1, 9];
    difficultyOptions = [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
    ];
    skills: any = [];
    requestBody = {
        "search": "",
        "sellerCode": null,
        "fromDate": null,
        "toDate": null,
        "updatedFromDate": null,
        "updatedToDate": null,
        "publishingType": null,
        "accessTypeId": null,
        "startPage": 1,
        "limit": 40,
        "bookmarks": [],
        "userList": [],
        "productCode": [],
        "status": null,
        "dateFilterType": null,
        "jobType": null,
        "count": 0,
        "loadBalancerValue": null,
        "updatedBy": [],
        "customFilter": [],
        "lock_status": null,
        "clientAM": null,
        "contactAM": null,
        "hiringManagers": null,
        "jobExtendedDataFilter": null,
        "campusTypes": null
    }

    constructor(
        private fb: FormBuilder, 
        private route: ActivatedRoute,
        private router: Router,
        private loadingSpinnerService: LoadingService,
        private apiService: ApiService,
        private messageService: MessageService
    ) {
        this.firstStepForm = this.fb.group({
            fetchExisting: ['no'],
            existingJob: [''],
            jobTitle: ['', [Validators.required, Validators.maxLength(100)]],
            jobDescription: ['', Validators.required],
        });
        this.secondStepForm = this.fb.group({
            jobType: [this.defaultSelectedJobTypes, Validators.required],
            jobLocation: [[], Validators.required],
            skills: [[], Validators.required],
            experience: ['', Validators.required],
            salaryRange: ['', [Validators.required, this.salaryRangeValidator]],
            currency: ['', Validators.required],
            period: ['', Validators.required],
            noticePeriod: ['', Validators.required],
        });
        this.thirdStepForm = this.fb.group({
            question: ['', Validators.required],
            deciderResponse: [false],
            additionalResponse: [false],
            useTalliteGPT: [false],
            noOfQuestion: [''],
            difficulty: [''],
            requiredAssessmentScore: [''],
            questions: this.fb.array([]),
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // this.getAllJobListings();
            this.editMode = !!params['id'];
            if (this.editMode) {
                this.loadJobDetails(params['id']);
                this.removeAddSpecificControls();
            }
            this.jobsList = jobListings;
            this.jobTypes = jobTypeList;
            this.jobLocations = countryList;
            this.experienceLevels = experienceLevels;
            this.noticePeriods = noticePeriods;
            this.period = durationList;
            this.currencies = currencyList;
            this.skills = skillsList;
        });
    }

    getAllJobListings(): void {
        this.loadingSpinnerService.show();
        this.apiService.getJobListings(this.requestBody).subscribe({
            next: (response) => {
                this.loadingSpinnerService.hide();
                if (response.status && response.data && response.data.list) {
                    this.jobsList = response.data.list.map((item: any) => ({
                        job_code: item.productCode,
                        job_name: item.productName,
                    }));
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching job data' });
                this.loadingSpinnerService.hide();
            },
        });
    }

    filterJobs(event: AutoCompleteCompleteEvent) {
        let filtered: any[] = [];
        let query = event.query;
        console.log(query)
        for (let i = 0; i < (this.jobsList as any[]).length; i++) {
            let job = (this.jobsList as any[])[i];
            if (job.job_name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(job);
            }
        }
        console.log(filtered)
        this.filteredJobsList = filtered;
    }

    onJobSelected(event: any) {
        this.loadingSpinnerService.show();
        const selectedJob = event;
        console.log(selectedJob.value.job_code);
        let body = {
            "sellerCode": 0,
            "productCode": selectedJob.value.job_code,
            "productType": 1
        }
        if (selectedJob) {
            this.apiService.getJobDetails(body).subscribe({
                next: (response) => {
                    if (response.status && response.data) {
                        this.loadingSpinnerService.hide();
                        this.selectedExistingJobDetails = response.data;
                    }
                },
                error: (error: any) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                    this.loadingSpinnerService.hide();
                },
            });
        }
    }

    private removeAddSpecificControls(): void {
        this.firstStepForm.removeControl('fetchExisting');
        this.firstStepForm.removeControl('existingJob');
    }

    salaryRangeValidator(control: AbstractControl): ValidationErrors | null {
        const salaryRangePattern = /^\d{1,3}(,\d{3})*(\d+)?(\s*-\s*\d{1,3}(,\d{3})*(\d+)?)?$/;
        const value = control.value;
        return salaryRangePattern.test(value) ? null : { invalidSalaryRange: true };
    }

    get questionFormArray(): FormArray {
        return this.thirdStepForm.get('questions') as FormArray;
    }
    
    addQuestion() {
        const { question, deciderResponse, additionalResponse } = this.thirdStepForm.value;
        if (this.thirdStepForm.valid) {
            const questionGroup = this.fb.group({
                id: [this.questionFormArray.length + 1],
                question: [question],
                deciderResponse: [deciderResponse],
                additionalResponse: [additionalResponse],
            });
            this.questionFormArray.push(questionGroup);
            this.thirdStepForm.patchValue({ question: '', deciderResponse: false, additionalResponse: false });
        }
    }
    
    editQuestion(index: number) {
        const questionGroup = this.questionFormArray.at(index);
        this.thirdStepForm.patchValue({
            question: questionGroup.get('question')?.value,
            deciderResponse: questionGroup.get('deciderResponse')?.value,
            additionalResponse: questionGroup.get('additionalResponse')?.value,
        });
        this.questionFormArray.removeAt(index);
    }
    
    deleteQuestion(index: number) {
        this.questionFormArray.removeAt(index);
    }
    
    toggleTalliteGPT() {
        if (!this.thirdStepForm.get('useTalliteGPT')?.value) {
            this.thirdStepForm.patchValue({
                noOfQuestion: '',
                difficulty: '',
                requiredAssessmentScore: '',
            });
        }
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

    navigate() {
        this.router.navigate(['/job-listings']);
    }

}
