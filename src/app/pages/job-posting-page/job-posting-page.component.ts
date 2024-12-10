import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { currencyList, countryList, noticePeriods, durationList, experienceLevels, jobTypeList, skillsList } from '../data';
import { ImportsModule } from '../../imports';
import { ApiService } from '../services/api.service';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

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
export class JobPostingPageComponent implements OnInit {
    firstStepForm!: FormGroup;
    secondStepForm!: FormGroup;
    thirdStepForm!: FormGroup;
    editMode: boolean = false;
    existing: any[] = [
        { name: 'Yes', key: 'yes' },
        { name: 'No', key: 'no' },
    ];
    expectedAnswer: any[] = [
        { name: 'Yes', key: 'yes' },
        { name: 'No', key: 'no' },
    ];
    responseInput: any[] = [
        { name: 'Required', key: 1 },
        { name: 'Not Required', key: 2 },
    ];
    selectedExistingJobDetails: any = {};
    jobsList: Array<Job> = [];
    filteredJobsList: Array<{ job_code: number; job_name: string }> = [];
    jobTypes: any[] = [];
    period: any[] = [];
    jobLocations: any[] = [];
    cityList: any[] = [];
    noticePeriods: any[] = [];
    currencies: any[] = [];
    experienceLevels: any[] = [];
    selectedLocations: any[] = [];
    defaultSelectedJobTypes = [1, 9];
    difficultyOptions = [
        { label: 'Easy', value: 25 },
        { label: 'Medium', value: 50 },
        { label: 'High', value: 75 },
        { label: 'Very High', value: 100 },
    ];
    skills: any = [];
    active: number | undefined = 0;

    constructor(
        private fb: FormBuilder, 
        private route: ActivatedRoute,
        private router: Router,
        private loadingSpinnerService: LoadingService,
        private apiService: ApiService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.getAllJobs();
            this.editMode = !!params['id'];
            if (this.editMode) {
                this.loadJobDetails(params['id']);
            }
            this.jobTypes = jobTypeList;
            this.jobLocations = countryList;
            this.experienceLevels = experienceLevels;
            this.noticePeriods = noticePeriods;
            this.period = durationList;
            this.currencies = currencyList;
            this.initStepperForms();
        });
        this.getLocations();
    }

    initStepperForms() {
        const jobTypeControls: { [key: string]: any } = {};
        this.jobTypes.forEach(job => {
            jobTypeControls[job.title] = [false];
        });

        this.firstStepForm = this.fb.group({
            fetchExisting: ['no'],
            existingJob: [''],
            jobTitle: ['', [Validators.required, Validators.maxLength(100)]],
            jobDescription: ['', Validators.required],
        });
        this.secondStepForm = this.fb.group({
            ...jobTypeControls,
            jobLocation: [[], Validators.required],
            skills: [[], Validators.required],
            experienceFrom: [null, [Validators.required, Validators.min(0), Validators.pattern('^\\d*(\\.\\d+)?$')]],
            experienceTo: [null, [Validators.required, Validators.min(0), Validators.pattern('^\\d*(\\.\\d+)?$')]],
            salaryFrom: [null, [Validators.required, Validators.min(0), Validators.pattern('^\\d*(\\.\\d+)?$')]],
            salaryTo: [null, [Validators.required, Validators.min(0), Validators.pattern('^\\d*(\\.\\d+)?$')]],
            currency: ['', Validators.required],
            period: ['', Validators.required],
            noticePeriodType: ['Immediate', Validators.required],
            noticeFrom: [null],
            noticeTo: [null],
        }, { validator: [this.experienceRangeValidator, this.salaryRangeValidator, this.noticePeriodRangeValidator] });
        this.initializeJobTypeFromString('');
        this.thirdStepForm = this.fb.group({
            question: ['', Validators.required],
            deciderResponse: [false],
            additionalResponse: [false],
            useTalliteGPT: [false],
            noOfQuestion: [null, [Validators.min(1), Validators.max(10)]],
            difficulty: [''],
            requiredAssessmentScore: [null, [Validators.min(1), Validators.max(100), Validators.pattern('^\\d*(\\.\\d+)?$')]],
            questions: this.fb.array([]),
        });

        this.toggleNoticePeriodValidators(this.secondStepForm.get('noticePeriodType')?.value);
        this.toggleTalliteQuestionsControls(this.thirdStepForm.get('useTalliteGPT')?.value)

        this.secondStepForm.get('noticePeriodType')?.valueChanges.subscribe(value => {
            this.toggleNoticePeriodValidators(value);
        });
        this.thirdStepForm.get('useTalliteGPT')?.valueChanges.subscribe(value => {
            this.toggleTalliteQuestionsControls(value);
        });
    }

    getLocations() {
        const body = {
            search: ""
        }
        this.apiService.getCityList(body).subscribe({
            next: (response) => {
                this.cityList = response.data.list
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching locations' });
            },
        });
    }

    getAllJobs(): void {
        const body = {
            "activeJobs": 1
        }
        this.loadingSpinnerService.show();
        this.apiService.getJobListings(body).subscribe({
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

    onSkillAdd(event: any) {
        const enteredSkill = event.value;
        if (enteredSkill && !this.skills.includes(enteredSkill)) {
          this.skills.push(enteredSkill);
        }
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

    initializeJobTypeFromString(jobTypeString: string): void {
        if (jobTypeString && jobTypeString.trim() !== '') {
            const selectedTitles = jobTypeString.split(',').map(title => title.trim());
            selectedTitles.forEach(title => {
                if (this.secondStepForm.controls[title]) {
                    this.secondStepForm.controls[title].setValue(true);
                }
            });
        }
    }

    getSelectedJobTypes(): string {
        const selectedTitles = this.jobTypes
            .filter(job => this.secondStepForm.controls[job.title].value)
            .map(job => job.title);
        return selectedTitles.join(', ');
    }

    isJobTypeInvalid(): boolean {
        return !this.jobTypes.some(job => this.secondStepForm.get(job.title)?.value);
    }

    setStepperFormData() {
        if(this.editMode) {
            this.firstStepForm.removeControl('fetchExisting');
            this.firstStepForm.removeControl('existingJob');
            this.firstStepForm.get('jobTitle')?.setValue('Value for control1');
            this.firstStepForm.get('jobDescription')?.setValue('Value for control1');
        } else {
            this.firstStepForm.get('jobTitle')?.setValue('Value for control1');
            this.firstStepForm.get('jobDescription')?.setValue('Value for control1');
        }
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

    experienceRangeValidator(control: AbstractControl): ValidationErrors | null {
        const experienceFrom = control.get('experienceFrom')?.value;
        const experienceTo = control.get('experienceTo')?.value;
        
        if (experienceFrom !== null && experienceTo !== null && experienceFrom >= experienceTo) {
            return { 'invalidExperienceRange': true };
        }
        return null;
    }

    salaryRangeValidator(control: AbstractControl): ValidationErrors | null {
        const salaryFrom = control.get('salaryFrom')?.value;
        const salaryTo = control.get('salaryTo')?.value;
        
        if (salaryFrom !== null && salaryTo !== null && salaryFrom >= salaryTo) {
            return { 'invalidSalaryRange': true };
        }
        return null;
    }

    noticePeriodRangeValidator(control: AbstractControl): ValidationErrors | null {
        const noticePeriodType = control.get('noticePeriodType')?.value;
        const noticeFrom = control.get('noticeFrom')?.value;
        const noticeTo = control.get('noticeTo')?.value;
    
        if (noticePeriodType === 'Other') {
            if (noticeFrom === null || noticeTo === null) {
                return { invalidNoticePeriodRange: true };
            }
            if (noticeFrom >= noticeTo) {
                return { invalidNoticePeriodRange: true };
            }
        }
        return null;
    }

    toggleNoticePeriodValidators(value: string) {
        const noticeFromControl = this.secondStepForm.get('noticeFrom');
        const noticeToControl = this.secondStepForm.get('noticeTo');

        if (value === 'Other') {
            noticeFromControl?.setValidators([Validators.required]);
            noticeToControl?.setValidators([Validators.required]);
        } else {
            noticeFromControl?.clearValidators();
            noticeToControl?.clearValidators();
            noticeFromControl?.reset(null);
            noticeToControl?.reset(null);
        }

        noticeFromControl?.updateValueAndValidity();
        noticeToControl?.updateValueAndValidity();
    }

    toggleTalliteQuestionsControls(value: boolean) {
        const noOfQuestion = this.thirdStepForm.get('noOfQuestion');
        const difficulty = this.thirdStepForm.get('difficulty');
        const requiredAssessmentScore = this.thirdStepForm.get('requiredAssessmentScore');

        if (value) {
            noOfQuestion?.setValidators([Validators.required]);
            difficulty?.setValidators([Validators.required]);
            requiredAssessmentScore?.setValidators([Validators.required]);
        } else {
            noOfQuestion?.clearValidators();
            difficulty?.clearValidators();
            requiredAssessmentScore?.clearValidators();
            noOfQuestion?.reset(null);
            difficulty?.reset('');
            requiredAssessmentScore?.reset(null);
        }

        noOfQuestion?.updateValueAndValidity();
        difficulty?.updateValueAndValidity();
        requiredAssessmentScore?.updateValueAndValidity();
    }

}
