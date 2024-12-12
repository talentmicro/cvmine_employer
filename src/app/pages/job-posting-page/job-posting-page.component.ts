import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { currencyList, countryList, noticePeriods, durationList, experienceLevels, jobTypeList } from '../data';
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
            this.getLocations();
            this.editMode = !!params['id'];
            if (this.editMode) {
                this.onJobSelected(params['id']);
            }
            this.jobTypes = jobTypeList;
            this.jobLocations = countryList;
            this.experienceLevels = experienceLevels;
            this.noticePeriods = noticePeriods;
            this.period = durationList;
            this.currencies = currencyList;
            this.initStepperForms();
        });
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
            deciderResponse: ['Yes', Validators.required],
            additionalResponse: ['Not Required', Validators.required],
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
                    if (response.status && response.data) {
                        this.loadingSpinnerService.hide();
                        this.selectedExistingJobDetails = {
                            "jobCode": response.data.jobDetails[0].productCode,
                            "jobTitle": response.data.jobDetails[0].productName,
                            "jobDescription": response.data.jobDetails[0].description,
                            "jobTypes": JSON.parse(response.data.jobDetails[0].jobType),
                            // "jobLocations": response.data.jobDetails[0].branchCode,
                            "jobLocations": [584527, 142939, 143251],
                            // "skills": response.data.jobDetails[0].skills,
                            "skills": "Java, MySQL, Oracle, Spring",
                            "experienceFrom": response.data.jobDetails[0].expFrom,
                            "experienceTo": response.data.jobDetails[0].expTo,
                            "currency": response.data.jobDetails[0].referralCurrencySymbol,
                            "salaryFrom": response.data.jobDetails[0].expSalaryFrom,
                            "salaryTo": response.data.jobDetails[0].expSalaryTo,
                            "duration": response.data.jobDetails[0].expSalaryScaleDurationId,
                            "noticePeriodFrom": response.data.jobDetails[0].noticePeriodFrom,
                            "noticePeriodTo": response.data.jobDetails[0].noticePeriodTo,
                            "questions": response.data.jobDetails[0].questions,
                            "noOfQuestions": response.data.jobDetails[0].noOfQuestions,
                            "difficulty": response.data.jobDetails[0].difficulty,
                            "cutoffScore": response.data.jobDetails[0].cutoffScore
                        }
                        this.setStepperFormData();
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
        }
        this.firstStepForm.get('jobTitle')?.setValue(this.selectedExistingJobDetails?.jobTitle || '');
        this.firstStepForm.get('jobDescription')?.setValue(this.selectedExistingJobDetails?.jobDescription || '');
        // if (this.selectedExistingJobDetails?.jobTypes) {
        //     const selectedJobTypes = this.selectedExistingJobDetails.jobTypes.split(',').map((type: any) => type.trim());
        //     this.jobTypes.forEach(job => {
        //         const control = this.secondStepForm.get(job.title);
        //         if (control) {
        //             control.setValue(selectedJobTypes.includes(job.title));
        //         }
        //     });
        // }
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
        this.thirdStepForm.get('question')?.setValue(this.selectedExistingJobDetails?.questions || '');
        this.thirdStepForm.get('deciderResponse')?.setValue(this.selectedExistingJobDetails?.deciderResponse || false);
        this.thirdStepForm.get('additionalResponse')?.setValue(this.selectedExistingJobDetails?.additionalResponse || false);
        this.thirdStepForm.get('useTalliteGPT')?.setValue(this.selectedExistingJobDetails?.useTalliteGPT || false);
        this.thirdStepForm.get('noOfQuestion')?.setValue(this.selectedExistingJobDetails?.noOfQuestions || null);
        this.thirdStepForm.get('difficulty')?.setValue(this.selectedExistingJobDetails?.difficulty || '');
        this.thirdStepForm.get('requiredAssessmentScore')?.setValue(this.selectedExistingJobDetails?.cutoffScore || null);

        if (this.selectedExistingJobDetails?.questions) {
            const questionsArray = this.thirdStepForm.get('questions') as FormArray;
            this.selectedExistingJobDetails?.questions.forEach((question: any) => {
                questionsArray.push(this.fb.group({
                    id: [this.questionFormArray.length + 1],
                    question: [question?.question],
                    deciderResponse: [question?.deciderResponse],
                    additionalResponse: [question?.additionalResponse],
                }));
            });
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
            this.thirdStepForm.patchValue({ question: '', deciderResponse: 'Yes', additionalResponse: 'Not Required' });
            this.thirdStepForm.get('question')?.clearValidators();
            this.thirdStepForm.get('question')?.updateValueAndValidity();
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

    submit() {
        console.log(this.firstStepForm.value);
        console.log(this.secondStepForm.value);
        console.log(this.thirdStepForm.value);
        if (this.firstStepForm.valid && this.secondStepForm.valid && this.thirdStepForm.valid) {
            this.loadingSpinnerService.show();
            const jobData = {
                data: [
                    {
                        "reqType": null,
                        "replacementEmpId": null,
                        "replacementEmpName": null,
                        "replacementEmpResignDate": null,
                        "replacementEmpLWD": null,
                        "priorityId": null,
                        "sellerCode": 25830,
                        "customerId": null,
                        "productName": this.firstStepForm.get('jobTitle')?.value,
                        "jobTitleId": 0,
                        "displayJobTitleId": null,
                        "displayJobTitle": null,
                        "productCodeText": "test111",
                        "intJobCode": null,
                        "employerName": "Test IT Pvt Ltd (ITPL-001)",
                        "productCode": this.editMode ? this.selectedExistingJobDetails.jobCode : 0,
                        "positions": 11,
                        "branchCode": this.secondStepForm.get('jobLocation')?.value,
                        "startDatetime": "",
                        "targetDatetime": "",
                        "wfTemplateCode": null,
                        "description": this.secondStepForm.get('jobDescription')?.value,
                        "jdAttachments": null,
                        "publishingType": [
                            7
                        ],
                        "technology": null,
                        "keySkills": [
                            32206
                        ],
                        "jobseeker_location": [
                            135569
                        ],
                        "jobType": [
                            1
                        ],
                        "caContactNumber": "",
                        "expFrom": 0,
                        "expTo": null,
                        "branches": null,
                        "skill": this.secondStepForm.get('skills')?.value,
                        "personalSkill": [],
                        "education": null,
                        "noticePeriodFrom": this.secondStepForm.get('noticeFrom')?.value,
                        "noticePeriodTo": this.secondStepForm.get('noticeTo')?.value,
                        "expSalaryCurrId": this.secondStepForm.get('currency')?.value,
                        "expSalaryFrom": this.secondStepForm.get('salaryFrom')?.value,
                        "expSalaryTo": this.secondStepForm.get('salaryTo')?.value,
                        "expSalaryScaleDurationId": this.secondStepForm.get('period')?.value,
                        "functionalArea": null,
                        "subFunctionalAreas": null,
                        "facesheetTemplateCode": null,
                        "clientCVTemplateId": null,
                        "hiringType": null,
                        "HTStartDatetime": null,
                        "HTEndDatetime": null,
                        "bands": null,
                        "bandId": null,
                        "modeId": null,
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
                        "assessmentTemplateCode": null,
                        "prefJobseekerBranch": [],
                        "status": 1,
                        "statusTitle": null,
                        "statusType": null,
                        "proximity": 20,
                        "distanceType": 1,
                        "industry": [],
                        "certification": [],
                        "caContactIsd": "+91",
                        "caContactName": "",
                        "notesForCA": "",
                        "roles": null,
                        "isIntJS": null,
                        "isHeight": 0,
                        "nationalities": null,
                        "workPermits": null,
                        "languages": null,
                        "heightCode": 1,
                        "visionCode": 1,
                        "bodyTypeCode": 1,
                        "roleTypeCode": 1,
                        "isVision": 0,
                        "isBodyType": 0,
                        "isPremiumRole": 0,
                        "isPhysicalChecked": 0,
                        "abilities": null,
                        "certiKeywords": "",
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
                        "consultant": null,
                        "consultantSDate": null,
                        "consultantEDate": null,
                        "team": null,
                        "promotype": 0,
                        "promobanners": 0,
                        "youtubeLink": null,
                        "promoYoutubeLink": null,
                        "footerdescription": null,
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
                        "to": null,
                        "cc": null,
                        "bcc": null,
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
                        "cvminePostings": null,
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
                    }
                ]
            };
            this.apiService.saveJob(jobData).subscribe((response) => {
                this.loadingSpinnerService.show();
                this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                this.firstStepForm.reset();
                this.secondStepForm.reset();
                this.thirdStepForm.reset();
                this.selectedLocations = [];
                
                this.router.navigate(['/job-listings']);
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form is not valid. Please complete all steps.' });
        }
    }

}
