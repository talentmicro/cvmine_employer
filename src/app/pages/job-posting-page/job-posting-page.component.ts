import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jobTypeList } from '../data';
import { QuillModule } from 'ngx-quill';
import { ImportsModule } from '../../imports';
import { ApiService } from '../services/api.service';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { SharedService } from '../services/shared.service';
import { LoginService } from '../services/auth/login.service';
import { Subject, takeUntil } from 'rxjs';
import { jsonParse } from '../../functions/shared-functions';

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
        ImportsModule,
        QuillModule
    ],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobPostingPageComponent implements OnInit, OnDestroy {
    userDetails!: any;
    firstStepForm!: FormGroup;
    secondStepForm!: FormGroup;
    // thirdStepForm!: FormGroup;
    editMode: boolean = false;
    existing: any[] = [
        { name: 'Yes', key: 'yes' },
        { name: 'No', key: 'no' },
    ];
    expectedAnswer: any[] = [
        { name: 'Yes', key: 1 },
        { name: 'No', key: 2 },
    ];
    responseInput: any[] = [
        { name: 'Required', key: 1 },
        { name: 'Not Required', key: 2 },
    ];
    private destroy$ = new Subject<void>();
    selectedExistingJobDetails: any = {};
    jobsList: Array<Job> = [];
    filteredJobsList: Array<{ job_code: number; job_name: string }> = [];
    jobTypes: any[] = [];
    period: any[] = [];
    cityList: any[] = [];
    currencies: any[] = [];
    selectedLocations: any[] = [];
    savedCustomQuestions: any[] = [];
    defaultSelectedJobTypes = [1, 9];
    difficultyOptions = [
        { label: 'Easy', value: 1 },
        { label: 'Medium', value: 2 },
        { label: 'High', value: 3 },
        { label: 'Very High', value: 4 },
    ];
    skills: any = [];
    active: number | undefined = 0;
    quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video']
        ],
    };

    constructor(
        private fb: FormBuilder, 
        private route: ActivatedRoute,
        private router: Router,
        private loadingSpinnerService: LoadingService,
        private apiService: ApiService,
        private messageService: MessageService,
        private sharedService: SharedService,
        private loginService: LoginService
    ) {
        this.loadingSpinnerService.show();
        this.userDetails = this.loginService.getUserDetails();
        this.route.params.subscribe((params) => {
            this.editMode = !!params['id'];
            this.sharedService.masterDropdowns$.pipe(takeUntil(this.destroy$)).subscribe({
                next: (data) => {
                    if (data) {
                        this.period = data.data.jobMasterData.scaleDurationList
                            .filter((item: any) => item.scaleDurationId !== 7)
                            .map((item: any) => ({
                                id: item.scaleDurationId,
                                title: item.name
                            }));
                        this.currencies = data.data.alertMasterData.currencyList;
                        if (this.editMode) {
                            this.getAllJobs();
                            this.onJobSelected(params['id']);
                        } else {
                            this.getAllJobs();
                        }
                    }
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                    this.loadingSpinnerService.hide();
                },
            });
            this.jobTypes = jobTypeList;
            
            this.initStepperForms();
        });
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    initStepperForms() {
        const jobTypeControls: { [key: string]: any } = {};
        if(this.jobTypes) {
            this.jobTypes.forEach(job => {
                jobTypeControls[job.title] = [false];
            });
        }

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
        // this.thirdStepForm = this.fb.group({
        //     questionId: [0],
        //     question: ['', Validators.required],
        //     deciderResponse: ['Yes', Validators.required],
        //     additionalResponse: ['Not Required', Validators.required],
        //     useTalliteGPT: [false],
        //     noOfQuestion: [null, [Validators.min(1), Validators.max(10)]],
        //     difficulty: [''],
        //     requiredAssessmentScore: [null, [Validators.min(1), Validators.max(100), Validators.pattern('^\\d*(\\.\\d+)?$')]],
        //     questions: this.fb.array([]),
        // });

        this.toggleNoticePeriodValidators(this.secondStepForm.get('noticePeriodType')?.value);
        // this.toggleTalliteQuestionsControls(this.thirdStepForm.get('useTalliteGPT')?.value)

        this.secondStepForm.get('noticePeriodType')?.valueChanges.subscribe(value => {
            this.toggleNoticePeriodValidators(value);
        });
        // this.thirdStepForm.get('useTalliteGPT')?.valueChanges.subscribe(value => {
        //     this.toggleTalliteQuestionsControls(value);
        // });
    }

    getLocations() {
        const body = {
            search: ""
        }
        this.apiService.getCityList(body).subscribe({
            next: (response) => {
                this.cityList = response.data.list;
                this.loadingSpinnerService.hide();
            },
            error: (error: any) => {
                this.loadingSpinnerService.hide();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching locations' });
            },
        });
    }

    getAllJobs(): void {
        const body = {
            "activeJobs": 1
        }
        this.apiService.getJobs(body).subscribe({
            next: (response) => {
                if (response.status && response.data && response.data.list) {
                    this.jobsList = response.data.list.map((item: any) => ({
                        job_code: item.productCode,
                        job_name: item.productName,
                    }));
                    this.getLocations();
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
        for (let i = 0; i < (this.jobsList as any[]).length; i++) {
            let job = (this.jobsList as any[])[i];
            if (job.job_name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(job);
            }
        }
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
        let productCode;
        if(this.editMode){
            productCode = event;
        } else {
            productCode = event.value.job_code
        }

        let body = {
            "sellerCode": 0,
            "productCode": productCode,
            "productType": 1
        }

        if (productCode) {
            this.apiService.getJobDetails(body).subscribe({
                next: (response) => {
                    // console.log(response);
                    if (response.status && response.data) {
                        this.selectedExistingJobDetails = {
                            "jobCode": response.data.jobDetails[0].productCode,
                            "productCodeText": response.data.jobDetails[0].productCodeText,
                            "jobTitle": response.data.jobDetails[0].productName,
                            "jobDescription": response.data.jobDetails[0].description,
                            "jobTypes": jsonParse(response.data.jobDetails[0].jobType),
                            "jobLocations": jsonParse(response.data.jobDetails[0].prefJobseekerBranch).map((item: any) => item.id),
                            "skills": response.data.jobDetails[0].certiKeywords,
                            "experienceFrom": response.data.jobDetails[0].expFrom,
                            "experienceTo": response.data.jobDetails[0].expTo,
                            "currency": response.data.jobDetails[0].expSalaryCurrId,
                            "salaryFrom": response.data.jobDetails[0].expSalaryFrom,
                            "salaryTo": response.data.jobDetails[0].expSalaryTo,
                            "duration": response.data.jobDetails[0].expSalaryScaleDurationId,
                            "noticePeriodFrom": response.data.jobDetails[0].noticePeriodFrom,
                            "noticePeriodTo": response.data.jobDetails[0].noticePeriodTo,
                            "useTalliteGPT": response.data.jobDetails[0].jobQuestions?.useGpt === 1,
                            "noOfQuestions": response.data.jobDetails[0].jobQuestions?.noOfQuestions,
                            "difficulty": response.data.jobDetails[0].jobQuestions?.difficultyLevel,
                            "cutoffScore": response.data.jobDetails[0].jobQuestions?.cutoffScore,
                            "questions": this.getCustomQuestions(response.data.jobDetails[0].jobQuestions?.customQuestions),
                            "cvminePostings": jsonParse(response.data.jobDetails[0].cvminePostings)
                        }
                        this.setStepperFormData();
                        if(!this.editMode) {
                            this.loadingSpinnerService.hide();
                        }
                    }
                },
                error: (error: any) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                    this.loadingSpinnerService.hide();
                },
            });
        }
    }

    getCustomQuestions(questionString: any) {
        if(questionString) {
            const customQuestions = jsonParse(questionString);
            this.savedCustomQuestions = customQuestions;
            // console.log(customQuestions);
            if(customQuestions?.length > 0) {
                return customQuestions;
            } else {
                return [];
            }
        } else {
            return [];
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
        }
        this.firstStepForm.get('jobTitle')?.setValue(this.selectedExistingJobDetails?.jobTitle || '');
        this.firstStepForm.get('jobDescription')?.setValue(this.selectedExistingJobDetails?.jobDescription || '');
        if (this.selectedExistingJobDetails?.jobTypes) {
            const selectedJobIds = this.selectedExistingJobDetails.jobTypes;
            this.jobTypes.forEach(job => {
                const control = this.secondStepForm.get(job.title);
                if (control) {
                    control.setValue(selectedJobIds.includes(job.jobType));
                }
            });
        }
        this.secondStepForm.get('jobLocation')?.setValue(this.selectedExistingJobDetails?.jobLocations || []);
        this.secondStepForm.get('skills')?.setValue(this.selectedExistingJobDetails.skills.split(',').map((skill: any) => skill.trim()));
        this.secondStepForm.get('experienceFrom')?.setValue(this.selectedExistingJobDetails?.experienceFrom || null);
        this.secondStepForm.get('experienceTo')?.setValue(this.selectedExistingJobDetails?.experienceTo || null);
        this.secondStepForm.get('salaryFrom')?.setValue(this.selectedExistingJobDetails?.salaryFrom || null);
        this.secondStepForm.get('salaryTo')?.setValue(this.selectedExistingJobDetails?.salaryTo || null);
        this.secondStepForm.get('currency')?.setValue(this.selectedExistingJobDetails?.currency || '');
        this.secondStepForm.get('period')?.setValue(this.selectedExistingJobDetails?.duration || '');
        this.secondStepForm.get('noticePeriodType')?.setValue(
            this.selectedExistingJobDetails.noticePeriodFrom || this.selectedExistingJobDetails.noticePeriodTo ? 'Other' : 'Immediate'
        );
        this.secondStepForm.get('noticeFrom')?.setValue(this.selectedExistingJobDetails?.noticePeriodFrom ?? null);
        this.secondStepForm.get('noticeTo')?.setValue(this.selectedExistingJobDetails?.noticePeriodTo || null);
        // this.thirdStepForm.get('question')?.setValue('');
        // this.thirdStepForm.get('deciderResponse')?.setValue(this.selectedExistingJobDetails?.deciderResponse || 'Yes');
        // this.thirdStepForm.get('additionalResponse')?.setValue(this.selectedExistingJobDetails?.additionalResponse || 'Not Required');
        // this.thirdStepForm.get('useTalliteGPT')?.setValue(this.selectedExistingJobDetails?.useTalliteGPT || false);
        // this.thirdStepForm.get('noOfQuestion')?.setValue(this.selectedExistingJobDetails?.noOfQuestions || null);
        // this.thirdStepForm.get('difficulty')?.setValue(this.selectedExistingJobDetails?.difficulty || '');
        // this.thirdStepForm.get('requiredAssessmentScore')?.setValue(this.selectedExistingJobDetails?.cutoffScore || null);

        // if (this.selectedExistingJobDetails?.questions) {
        //     const questionsArray = this.thirdStepForm.get('questions') as FormArray;
        //     this.selectedExistingJobDetails?.questions.forEach((question: any) => {
        //         questionsArray.push(this.fb.group({
        //             id: [this.questionFormArray.length + 1],
        //             questionId: [question.id],
        //             question: [question?.question],
        //             deciderResponse: [question?.expectedAnswer === 1 ? 'Yes' : 'No'],
        //             additionalResponse: [question?.responseInput === 1 ? 'Required' : 'Not Required'],
        //         }));
        //     });
        // }
        // if(this.selectedExistingJobDetails?.questions.length > 0) {
        //     this.thirdStepForm.get('question')?.clearValidators();
        //     this.thirdStepForm.get('question')?.updateValueAndValidity();
        // }
    }

    // get questionFormArray(): FormArray {
    //     return this.thirdStepForm.get('questions') as FormArray;
    // }
    
    // addQuestion() {
    //     const { question, questionId, deciderResponse, additionalResponse } = this.thirdStepForm.value;
    //     if (this.thirdStepForm.get('question')?.value) {
    //         const questionGroup = this.fb.group({
    //             id: [this.questionFormArray.length + 1],
    //             questionId: questionId ? [questionId] : 0,
    //             question: [question],
    //             deciderResponse: [deciderResponse],
    //             additionalResponse: [additionalResponse],
    //         });
    //         this.questionFormArray.push(questionGroup);
    //         this.thirdStepForm.patchValue({ questionId: 0, question: '', deciderResponse: 'Yes', additionalResponse: 'Not Required' });
    //         this.thirdStepForm.get('question')?.clearValidators();
    //         this.thirdStepForm.get('question')?.updateValueAndValidity();
    //     }
    // }
    
    // editQuestion(index: number) {
    //     const questionGroup = this.questionFormArray.at(index);
    //     this.thirdStepForm.patchValue({
    //         questionId: questionGroup.get('questionId')?.value,
    //         question: questionGroup.get('question')?.value,
    //         deciderResponse: questionGroup.get('deciderResponse')?.value,
    //         additionalResponse: questionGroup.get('additionalResponse')?.value,
    //     });
    //     this.questionFormArray.removeAt(index);
    // }
    
    // deleteQuestion(index: number) {
    //     this.questionFormArray.removeAt(index);
    // }
    
    // toggleTalliteGPT() {
    //     if (!this.thirdStepForm.get('useTalliteGPT')?.value) {
    //         this.thirdStepForm.patchValue({
    //             noOfQuestion: '',
    //             difficulty: '',
    //             requiredAssessmentScore: '',
    //         });
    //     }
    // }

    navigate() {
        this.router.navigate(['/job-listings']);
    }

    experienceRangeValidator(control: AbstractControl): ValidationErrors | null {
        const experienceFrom = control.get('experienceFrom')?.value;
        const experienceTo = control.get('experienceTo')?.value;
        
        if (experienceFrom !== null && experienceTo !== null && Number(experienceFrom) >= Number(experienceTo)) {
            return { 'invalidExperienceRange': true };
        }
        return null;
    }

    salaryRangeValidator(control: AbstractControl): ValidationErrors | null {
        const salaryFrom = control.get('salaryFrom')?.value;
        const salaryTo = control.get('salaryTo')?.value;
        if (salaryFrom !== null && salaryTo !== null && Number(salaryFrom) >= Number(salaryTo)) {
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

    // toggleTalliteQuestionsControls(value: boolean) {
    //     const noOfQuestion = this.thirdStepForm.get('noOfQuestion');
    //     const difficulty = this.thirdStepForm.get('difficulty');
    //     const requiredAssessmentScore = this.thirdStepForm.get('requiredAssessmentScore');

    //     if (value) {
    //         noOfQuestion?.setValidators([Validators.required]);
    //         difficulty?.setValidators([Validators.required]);
    //         requiredAssessmentScore?.setValidators([Validators.required]);
    //     } else {
    //         noOfQuestion?.clearValidators();
    //         difficulty?.clearValidators();
    //         requiredAssessmentScore?.clearValidators();
    //         noOfQuestion?.reset(null);
    //         difficulty?.reset('');
    //         requiredAssessmentScore?.reset(null);
    //     }

    //     noOfQuestion?.updateValueAndValidity();
    //     difficulty?.updateValueAndValidity();
    //     requiredAssessmentScore?.updateValueAndValidity();
    // }

    submit() {
        // if (this.firstStepForm.valid && this.secondStepForm.valid && this.thirdStepForm.valid) {
        if (this.firstStepForm.valid && this.secondStepForm.valid) {
            this.loadingSpinnerService.show();
            const selectedJobTypes: number[] = [];
            jobTypeList.forEach(item => {
                if (this.secondStepForm.controls[item.title]?.value) {
                    selectedJobTypes.push(item.jobType);
                }
            });
            const prefJobseekerBranch = this.cityList.filter(item => this.secondStepForm.get('jobLocation')?.value.includes(item.id));
            // const customQuestions = this.thirdStepForm.get('questions')?.value.map((item: any) => {
            //     return {
            //         questionId: item?.questionId,
            //         question: item?.question,
            //         expectedAnswer: item.deciderResponse === 'Yes' ? 1 : 2,
            //         responseInput: item.additionalResponse === 'Required' ? 1 : 2
            //     };
            // });
            // // console.log("saved", this.savedCustomQuestions);
            // // console.log("formarray", customQuestions)
            // const originalQuestionIds = this.savedCustomQuestions?.map(q => q.id);
            // const addedQuestionIds = customQuestions.filter((q: any) => q.questionId !== 0).map((q: any) => q.questionId);
            // const deletedQuestionIds = originalQuestionIds.filter(id => !addedQuestionIds.includes(id));
            // // console.log('deleted questions ID', deletedQuestionIds);
            const jobData = {
                data: [{
                    "sellerCode": Number(this.userDetails.sellerCode),
                    "customerId": null,
                    "productName": this.firstStepForm.get('jobTitle')?.value,
                    "jobTitleId": 0,
                    "productCodeText": this.editMode ? this.selectedExistingJobDetails.productCodeText : "",
                    "intJobCode": null,
                    "employerName": this.userDetails.displayName,
                    "productCode": this.editMode ? this.selectedExistingJobDetails.jobCode : 0,
                    "positions": 1, 
                    "startDatetime": "",
                    "targetDatetime": "",
                    "description": this.firstStepForm.get('jobDescription')?.value,
                    "jdAttachments": null,
                    "publishingType": [
                        7
                    ],
                    "technology": null,
                    "keySkills": [],
                    "jobseeker_location": this.secondStepForm.get('jobLocation')?.value,
                    "jobType": selectedJobTypes,
                    "caContactNumber": "",
                    "expFrom": this.secondStepForm.get('experienceFrom')?.value,
                    "expTo": this.secondStepForm.get('experienceTo')?.value,
                    "branches": null,
                    "skill": [],
                    "personalSkill": [],
                    "education": null,
                    "noticePeriodFrom": this.secondStepForm.get('noticePeriodType')?.value === 'Other' ? this.secondStepForm.get('noticeFrom')?.value : 0,
                    "noticePeriodTo": this.secondStepForm.get('noticePeriodType')?.value === 'Other' ? this.secondStepForm.get('noticeTo')?.value : 0,
                    "expSalaryCurrId": this.secondStepForm.get('currency')?.value,
                    "expSalaryFrom": this.secondStepForm.get('salaryFrom')?.value,
                    "expSalaryTo": this.secondStepForm.get('salaryTo')?.value,
                    "expSalaryScaleDurationId": this.secondStepForm.get('period')?.value,
                    "functionalArea": null,
                    "subFunctionalAreas": null,
                    "ContractAmount": null,
                    "ContractCurrencyId": 2,
                    "presentSalaryCurrId": null,
                    "presentSalaryCurrSymbol": null,
                    "presentSalaryFrom": null,
                    "presentSalaryTo": null,
                    "presentSalaryScaleDurationId": 4,
                    "paymentTermCode": null,
                    "totalCVReq": null,
                    "publishJobFor": 1,
                    "sourcingType": null,
                    "prefJobseekerBranch": prefJobseekerBranch,
                    "status": 1,
                    "statusTitle": null,
                    "statusType": null,
                    "proximity": 20,
                    "industry": [],
                    "certification": [],
                    "caContactIsd": "+91",
                    "caContactName": "",
                    "notesForCA": "",
                    "roles": null,
                    "roleTypeCode": 1,
                    "isVision": 0,
                    "isBodyType": 0,
                    "isPremiumRole": 0,
                    "isPhysicalChecked": 0,
                    "abilities": null,
                    "certiKeywords": this.secondStepForm.get('skills')?.value.join(', '),
                    "allSkillMatch": 0,
                    "contractExtendable": 1,
                    "cvPriceCurrencyId": 2,
                    "maxCvPrice": null,
                    "isActiveCV": null,
                    "isALCV": null,
                    "ALCVStartDate": null,
                    "ALCVEndDate": null,
                    "cvSourceType": 1,
                    "fromAge": null,
                    "toAge": null,
                    "gender": null,
                    "team": null,
                    "promotype": 0,
                    "promobanners": 0,
                    "clientContacts": [],
                    "referralSuccessFee": null,
                    "referralSuccessFeeCurrencyId": null,
                    "referralSuccessFeeScaleId": null,
                    "fromCVRating": 1,
                    "toCVRating": 5,
                    "fromCommSkillRating": 1,
                    "toCommSkillRating": 5,
                    "assessment": null,
                    "pubForIntPartnerGroup": null,
                    "vendors": [],
                    "templateId": null,
                    "templateName": null,
                    "grade": null,
                    "isTemplate": 0,
                    "skillRankingList": [],
                    "extendedData": [],
                    "cvMinePublishTermId": null,
                    "cvMinePublishTermDesc": null,
                    "cvMineTALToken": null,
                    "cvMineCurrencyId": null,
                    "cvMineAmount": null,
                    "publicInformation": null,
                    "notes": null,
                    "projectId": null,
                    "projectName": null,
                    "tools": null,
                    "targetCompanies": [],
                    "internalHiringManagers": null,
                    "unifiedTemplateId": null,
                    "jobMessage": null,
                    "banners": null,
                    "totalCVLimit": null,
                    "badges": null,
                    "sourcingTypes": null,
                    // "jobQuestions":{
                    //     "noOfQuestions": this.thirdStepForm.get('useTalliteGPT')?.value ? this.thirdStepForm.get('noOfQuestion')?.value : null,
                    //     "difficulty": this.thirdStepForm.get('useTalliteGPT')?.value ? this.thirdStepForm.get('difficulty')?.value : null,
                    //     "cutoffScore": this.thirdStepForm.get('useTalliteGPT')?.value ? this.thirdStepForm.get('requiredAssessmentScore')?.value : null,
                    //     "useGpt": this.thirdStepForm.get('useTalliteGPT')?.value ? 1 : 0,
                    //     "deleteQuestionId": deletedQuestionIds,
                    //     "customQuestions": this.questionFormArray.length > 0 ? customQuestions : []
                    // },
                    "assetTemplateId": null,
                    "careerPortalFieldConfigTemplateId": null,
                    "vehicleTypes": null,
                    "marriedStatus": null,
                    "vaccinatedStatus": null,
                    "netSalaryCurrId": null,
                    "netSalaryFrom": null,
                    "netSalaryTo": null,
                    "netSalaryScaleCode": null,
                    "offerOnbFormTemplate": null,
                    "positionsArray": null,
                    "candidateDocumentTemplateId": null,
                    "extJSON": {
                            "extEnableSourcingFee": null,
                            "extSourcingFeeType": null,
                            "extSourcingFeeCurrencyId": null,
                            "extSourcingFee": null,
                            "careerPortalStartDate": null,
                            "careerPortalEndDate": null,
                            "IJPStartDate": null,
                            "IJPEndDate": null,
                            "IJPERPostingJD": null,
                            "ERStartDate": null,
                            "EREndDate": null,
                            "contractTenure": null,
                            "hmConsentToPublishJobToIJP": null,
                            "anyExceptionForIJP": null,
                            "IJPExceptionList": null,
                            "workingDaysId": null,
                            "jobShiftId": null,
                            "salaryBenefitId": null,
                            "workTypeId": null,
                            "contactEmailId": null,
                            "clientLocation": null,
                            "RRFProcessType": null,
                            "POStartDatetime": null,
                            "POEndDatetime": null,
                            "POAttachment": null,
                            "cvmineJobHeader": null,
                            "extIntegrationRole": null,
                            "extIntCityId": null,
                            "extIntStateId": null,
                            "extIntEducationId": null
                    },
                    "reqSourceTypeId": null,
                    "folders": null,
                    "cvminePostings": this.editMode && this.selectedExistingJobDetails.cvminePostings.length > 0 ? this.selectedExistingJobDetails.cvminePostings : null,
                    "formTemplateId": null,
                    "organizationId": null,
                    "entityId": null,
                    "teamBucketingId": null,
                    "companyId": null,
                    "sbumisId": null,
                    "costcenterId": null,
                    "functionId": null,
                    "subFunctionId": null,
                    "budgetedYear": "2024-2025",
                    "jobCategoryId": null,
                    "hrOpsUserId": null,
                    "onbSpocUserId": null,
                    "digitalSignatories": null,
                    "schemeType": null,
                    "cvmineCareerGroups": null,
                    "bgvVendorSellerCode": null,
                    "customApprovers": null,
                    "sapPositionCode": null,
                    "cvMinePostingCategory": null,
                    "interviewPanels": null,
                    "assesshubFlowId": null,
                    "assesshubTemplateId": null,
                    "sendInviteConfirmationForAssesshub": null,
                    "mainGroup": null,
                    "subGroup": null,
                    "referralTemplateId": null,
                    "lobDetails": null
                }]
            };
            // console.log(jobData);
            this.apiService.saveJob(jobData).subscribe((response) => {
                if(response.status) {
                    // console.log(response);
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.firstStepForm.reset();
                    this.secondStepForm.reset();
                    // this.thirdStepForm.reset();
                    this.selectedLocations = [];
                    this.loadingSpinnerService.hide();
                    this.router.navigate(['/job-listings']);
                } else {
                    this.loadingSpinnerService.hide();
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                    return;
                }
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form is not valid. Please complete all steps.' });
        }
    }

}
