import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportsModule } from '../../imports';
import { MessageService } from 'primeng/api';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { SharedService } from '../services/shared.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-applicant-details-page',
    templateUrl: './applicant-details-page.component.html',
    styleUrl: './applicant-details-page.component.scss',
    standalone: true,
    imports: [
        ImportsModule
    ],
    providers: [MessageService]
})

export class ApplicantDetailsPageComponent {
    applicantDetails: any = {};
    resId!: number;
    alertId!: number;
    productCode!: number;
    applicationStatuses: any = [];
    notes: any = [];
    questions: any = [];
    dummyApplicantDetails = {
        resumeDetails: {
            "isEdit": 1,
            "lngId": 1,
            "partnerId": 276301,
            "partnerName": "ADMIN",
            "isEditable": 1,
            "alertId": 2311810,
            "firstName": "Test",
            "lastName": "T",
            "profilePicture": "",
            "mobileIsd": "+91",
            "mobileNumber": "123456789",
            "waMobileIsd": "",
            "waMobileNumber": "",
            "altMobileIsd": "",
            "isAlternateNo": 0,
            "altMobileNumber": "",
            "emailId": "anand.kamble@talentmicro.com",
            "originalCVPath": "4ddf55e3-9431-48be-a30c-a1ef641c45b7.pdf",
            "cvPath": "4ddf55e3-9431-48be-a30c-a1ef641c45b7.pdf",
            "cvFileName": "Yuvraj_Resume.pdf",
            "roles": "[]",
            "keySkills": "[{\"id\": 286212, \"title\": \"javasacript\", \"skillCode\": 286212}]",
            "skillRankingList": "[{\"title\": \"javasacript\", \"status\": null, \"skillCode\": 286212, \"experience\": null, \"skillLevel\": null}]",
            "languages": "[]",
            "abilities": "[]",
            "genderCode": 1,
            "genderTitle": "Male",
            "dob": null,
            "isAffirmative": 1,
            "resumeStatusCode": 1,
            "resumeStatusTitle": "Active",
            "restrictDirectSubmission": 0,
            "interestedAfterDate": "2024-11-14",
            "presentLocation": "Hubballi, Karnataka, India",
            "presentLocationId": 145230,
            "countryId": 0,
            "countryCode": "",
            "presentEmployer": "Yes",
            "latitude": "15.364708300000000",
            "longitude": "75.123954700000000",
            "totalExp": "1.00",
            "anyKeywords": "",
            "cvKeywords": "",
            "noticePeriod": 10,
            "presentSalaryCurrId": 2,
            "presentSalaryCurr": "INR",
            "presentSalary": "0.00",
            "presentSalaryScaleDurationId": 0,
            "presentSalaryeDuration": "",
            "expSalaryScaleDurationId": 0,
            "expSalaryCurrId": 2,
            "expSalaryCurr": "INR",
            "expSalary": "0.00",
            "expSalaryDuration": "",
            "declareResumeOwnership": 1,
            "crDate": "2024-11-14 07:30:29",
            "crUserId": 276301,
            "createdBy": "ADMIN",
            "luDate": "2024-12-18 12:28:21",
            "luUserId": 276317,
            "updatedBy": "Alagappan Arunachalam",
            "jobType": "[1,9]",
            "preferredLocation": "[{\"latitude\": 20.593684000000000, \"countryId\": 0, \"longitude\": 78.962880000000000, \"locationId\": 135653, \"countryCode\": null, \"prefLocation\": \"India\"},{\"latitude\": 15.317277500000000, \"countryId\": 0, \"longitude\": 75.713888400000000, \"locationId\": 91924, \"countryCode\": null, \"prefLocation\": \"Karnataka, India\"},{\"latitude\": 15.364708300000000, \"countryId\": 0, \"longitude\": 75.123954700000000, \"locationId\": 145230, \"countryCode\": null, \"prefLocation\": \"Hubballi, Karnataka, India\"}]",
            "education": "[{\"mop\": 0, \"yop\": 0, \"summary\": \"\\\"\\\"\", \"collegeId\": 0, \"monthName\": \"\", \"passingMN\": \"\", \"percentage\": \"80\", \"startingMN\": \"\", \"university\": \"Abhilashi University\", \"collegeName\": \"\", \"educationCode\": 60132, \"educationType\": 1, \"educationLevel\": 6, \"educationTitle\": \"Any Engineering\", \"percentageType\": 1, \"universityCode\": 183372, \"educationCountry\": null, \"specializationCode\": 0, \"specializationTitle\": \"\", \"educationCountryName\": \"\"}]",
            "industry": "[]",
            "designation": "Software Developer Intern- Java",
            "cvRating": 1,
            "gurl": "https://storage.googleapis.com/ezeone/icanrefer/icr_cvrating_guide_v1.html",
            "commSkillGuideUrl": "https://storage.googleapis.com/ezeone/icanrefer/icr_commrating_guide_v1.html",
            "isIntJS": 0,
            "nationalityCode": 356,
            "commSkillRating": 1,
            "isHeight": 0,
            "heightCode": -1,
            "isVision": 0,
            "visionCode": -1,
            "isBodyType": 0,
            "bodyTypeCode": -1,
            "isPremiumRole": 0,
            "workPermits": "[]",
            "isPhysicalChecked": 1,
            "altEmailId": "",
            "consultants": "[]",
            "cvSourceType": 2,
            "cvType": 1,
            "notes": "This is an attachment for interview feedback",
            "stageTitle": "  ",
            "stageCode": 0,
            "statusCode": 10619,
            "statusTitle": "Internal Round - Scheduled",
            "source": 138,
            "sourceTitle": "Linked In",
            "jobTitleId": 107666,
            "extendedData": "[{\"value\": \"JS\", \"refType\": 2, \"tableId\": 0, \"cssClass\": \"\", \"refLabel\": \"Certifications\", \"fieldCode\": 918, \"mandatory\": 0, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"Certifications\", \"attachValue\": \"[{\\\"cdnPath\\\": \\\"3600cdf9-88df-4b28-858a-e6d68999f4b8.jpeg\\\", \\\"fileName\\\": \\\"JS datatypes.jpeg\\\"}]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 1, \"validationRegExp\": \"\"},{\"value\": \"1725\", \"refType\": 5, \"tableId\": 1012, \"cssClass\": \"\", \"refLabel\": \"Status of Visa\", \"fieldCode\": 917, \"mandatory\": 0, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"\", \"attachValue\": \"[]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 0, \"validationRegExp\": \"\"},{\"value\": \"1721\", \"refType\": 5, \"tableId\": 1011, \"cssClass\": \"\", \"refLabel\": \"Onsite\", \"fieldCode\": 916, \"mandatory\": 0, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"\", \"attachValue\": \"[]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 0, \"validationRegExp\": \"\"},{\"value\": \"1717\", \"refType\": 5, \"tableId\": 1010, \"cssClass\": \"\", \"refLabel\": \"Are you open to relocating?\", \"fieldCode\": 915, \"mandatory\": 1, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"\", \"attachValue\": \"[]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 0, \"validationRegExp\": \"\"},{\"value\": \"2\", \"refType\": 2, \"tableId\": 0, \"cssClass\": \"\", \"refLabel\": \"Relevant Experience.\", \"fieldCode\": 760, \"mandatory\": 1, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"\", \"attachValue\": \"[]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 0, \"validationRegExp\": \"\"},{\"value\": \"{}\", \"refType\": 13, \"tableId\": 0, \"cssClass\": \"\", \"refLabel\": \"Attachments/Documents\", \"fieldCode\": 329, \"mandatory\": 0, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"Attachments/Documents\", \"attachValue\": \"[]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 0, \"validationRegExp\": \"\"},{\"value\": \"\", \"refType\": 4, \"tableId\": 0, \"cssClass\": \"\", \"refLabel\": \"LinkedIn URL\", \"fieldCode\": 44, \"mandatory\": 0, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"\", \"attachValue\": \"[]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 0, \"validationRegExp\": \"\"},{\"value\": \"\", \"refType\": 2, \"tableId\": null, \"cssClass\": null, \"refLabel\": \"Alternative Mobile Number\", \"fieldCode\": 31, \"mandatory\": 0, \"date1Label\": \"\", \"date1Value\": null, \"date2Label\": \"\", \"date2Value\": null, \"attachLabel\": \"\", \"attachValue\": \"[]\", \"date1Visible\": 0, \"date2Visible\": 0, \"attachVisible\": 0, \"validationRegExp\": \"\"}]",
            "facesheetTemplateCode": null,
            "facesheetTemplateCodeTitle": "",
            "facesheet": "[]",
            "clientCVPath": null,
            "clientCVFileName": null,
            "salutationId": 2,
            "employmentHistory": "[]",
            "sourceRef": "Nisar MP",
            "servingNP": 0,
            "lwd": null,
            "ppNumber": "",
            "ppExpiryDate": null,
            "middleName": "",
            "presentSalaryValueMapId": 0,
            "expectedSalaryValueMapId": 0,
            "noticePeriodId": 0,
            "experienceId": 0,
            "ppIssueDate": null,
            "isECR": 0,
            "functionalArea": "[0]",
            "subFunctionalAreas": "[0]",
            "maskedCV": "[]",
            "isMobileNumberOnWA": 0,
            "isAltMobileNumberOnWA": 0,
            "linkedIn": "",
            "facebook": "",
            "instagram": "",
            "twitter": "",
            "weChat": "",
            "tools": "",
            "activeTransaction": 0,
            "totalTransaction": 1,
            "sourceBy": "ADMIN",
            "sourceOn": "2024-11-14 07:30:27",
            "sourceRefTitle": "Nisar MP",
            "languageData": "[]",
            "visaData": "[]",
            "certificationData": "[]",
            "drivingLicense": "[]",
            "recruiterName": null,
            "portal_profile_link": "",
            "bankNameId": 0,
            "bankName": "",
            "bankAddressLine1": "",
            "bankAddressLine2": "",
            "bankPostalCode": "",
            "bankCityId": 0,
            "bankStateId": 0,
            "bankCountryId": 0,
            "bankRefCode": "",
            "bankAccountNumber": "",
            "bankAttachments": "[]",
            "panCardNumber": "",
            "panAttach": "[]",
            "aadharNumber": "",
            "aadharAttach": "[]",
            "fatherName": "",
            "isSpeciallyAbled": 0,
            "specialAbledDesc": "",
            "speciallyAbled": "[]",
            "presentAddress": "{\"cityId\": null, \"status\": null, \"stateId\": null, \"cityName\": null, \"latitude\": null, \"countryId\": null, \"longitude\": null, \"stateName\": null, \"postalCode\": null, \"attachments\": null, \"countryName\": null, \"addressLine1\": null, \"addressLine2\": null}",
            "permanentAddress": "{\"cityId\": null, \"status\": null, \"stateId\": null, \"cityName\": null, \"latitude\": null, \"countryId\": null, \"longitude\": null, \"stateName\": null, \"postalCode\": null, \"attachments\": null, \"countryName\": null, \"addressLine1\": null, \"addressLine2\": null}",
            "netSalaryCurrId": 0,
            "netSalary": "0.00",
            "netSalaryScaleCode": null,
            "netSalaryDurationCode": null,
            "netSalarySDTemplateCode": null,
            "netSalaryValueMapId": 0,
            "baseConvNetSalary": null,
            "vaccinationStatus": 0,
            "vaccinationDate": null,
            "PFNumber": "",
            "UANNumber": "",
            "ESINumber": "",
            "martialStatus": 0,
            "spouseName": "",
            "personalEmailID": "",
            "bloodGroup": 0,
            "pickUpPoint": "\"\"",
            "nomineeItems": "[]",
            "emergencyContacts": "[]",
            "marriageDate": null,
            "assessmentAvailable": 0,
            "cvmineInfo": "{\"ppDOB\": null, \"gccExp\": null, \"height\": null, \"title1\": null, \"title2\": null, \"weight\": null, \"hobbies\": null, \"summary\": null, \"eyeSight\": 1, \"heightType\": 1, \"motherName\": null, \"veteranJob\": null, \"weightType\": 1, \"cvValidated\": null, \"isPreviewed\": null, \"licenseData\": null, \"verteranRank\": null, \"hobbiesSearch\": null, \"veteranStatus\": null, \"ppIssueCountry\": null, \"appearingRating\": null, \"generatedCVHTML\": null, \"consentMandatory\": null, \"excludeEmployers\": null, \"socialMediaLinks\": null, \"socialLevelRating\": null, \"physicalFitnessRating\": null, \"leadershipSkillsRating\": null, \"interpersonalSkillsRating\": 3, \"jobSearchProximityDistance\": null, \"jobSearchProximityDistanceType\": 1}",
            "fieldConfigTemplateList": "[]",
            "technologyText": null,
            "technology": "[]",
            "aadharNumberValidationStatus": null,
            "folders": "[]",
            "jobseekerId": "",
            "icrListingStatusId": "0",
            "icrCandidateStatusId": "0",
            "icanreferAssessmentMaster": "[{\"id\": 1, \"level\": null, \"title\": \"Leadership\", \"description\": null},{\"id\": 2, \"level\": null, \"title\": \"Communication level\", \"description\": null},{\"id\": 3, \"level\": null, \"title\": \"Global Exposure\", \"description\": null},{\"id\": 4, \"level\": null, \"title\": \"Soft skills\", \"description\": null},{\"id\": 5, \"level\": null, \"title\": \"Personality\", \"description\": null},{\"id\": 6, \"level\": null, \"title\": \"Education level\", \"description\": null},{\"id\": 7, \"level\": null, \"title\": \"Overall candidate level\", \"description\": null},{\"id\": 8, \"level\": null, \"title\": \"Ready for Travel\", \"description\": null},{\"id\": 9, \"level\": null, \"title\": \"Anchor/Model Status\", \"description\": null}]",
            "excludeEmployers": "[]",
            "resId": 3982738,
            "generalSkills": "[]",
            "clientCVTemplateId": 0,
            "cvmineCareerPaths": "[{\"careerLevel\": 0, \"careerPathId\": 0, \"profileLevel\": 0}]",
            "relevantSkills": "[]",
            "relevantSkillRankingList": "[]",
            "relExpinYears": 0,
            "relExpinMonth": 0,
            "recruitmentCategory": 0,
            "casteCategory": 0,
            "weight": "0",
            "isAppliedForPanCard": 0,
            "empGrade": 0,
            "presentEmployerId": 0,
            "presentSalaryVariableAmt": "0.00",
            "presentSalaryTotalAmt": "0.00",
            "expSalaryVariableAmt": "0.00",
            "expSalaryTotalAmt": "0.00"
        },
        requirementHistory: [
            {
                "alertId": 2311810,
                "productCode": 122687,
                "productName": "Software Developer Intern- Java",
                "productCodeText": "test/2024/1",
                "employerName": "Test Department (Test)",
                "crDate": "2024-11-14 07:30:29",
                "crUserId": 276301,
                "createdBy": "ADMIN",
                "luDate": "2024-12-18 12:28:21",
                "luUserId": 276317,
                "updatedBy": "Alagappan Arunachalam",
                "stageTitle": "Internal Round",
                "statusTitle": "Scheduled",
                "reasonTitle": ""
            }
        ],
        requirementSummary: {
            "productCode": 122687,
            "productName": "Software Developer Intern- Java",
            "productCodeText": "test/2024/1",
            "employerName": "Test Department (Test)",
            "crDate": "2024-11-14 06:03:26",
            "crUserId": 276301,
            "createdBy": "ADMIN",
            "luDate": "2024-12-13 09:16:27",
            "luUserId": 276301,
            "updatedBy": "ADMIN",
            "statusTitle": "Paused",
            "publishingTypeTitle": "Job Posting, Recruitment Team"
        },
        notes: [
            {
                text: 'This is a sample note, discussing the status change.',
                timestamp: new Date(),
            },
            {
                text: 'A confirmation message from the other user.',
                timestamp: new Date(),
            },
            {
                text: 'This is a sample note, discussing the status change.',
                timestamp: new Date(),
            },
            {
                text: 'A confirmation message from the other user.',
                timestamp: new Date(),
            }
        ],
        questions: [
            {
                title: 'Do you have 5 years of experience?',
                text: 'We are looking for someone with at least 5 years of relevant experience.',
                expectedAnswer: 'Yes',
                response: 'Yes',
                assessmentScore: 80,
            },
            {
                title: 'Are you familiar with Angular?',
                text: 'Angular experience is required for this role.',
                expectedAnswer: 'Yes',
                response: 'No',
                assessmentScore: 40,
            }
        ],
        taliteQuestions: {
            questions: [
                {
                    question: "Explain dependency injection in Angular.",
                    answers: ["Dependency injection is ..."],
                    assessmentScore: 85,
                },
                {
                    question: "What is closure in JavaScript?",
                    answers: ["A closure is ..."],
                    assessmentScore: 90,
                },
            ],
        },
    }
    selectedStatus: string | null = null;
    currentStatus: string = '';
    note: string = '';
    showConfirmation: boolean = false;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private sharedService: SharedService,
        private loadingSpinnerService: LoadingService,
        private apiService: ApiService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.loadingSpinnerService.show()
            this.resId = params['resId'];
            this.alertId = params['alertId'];
            this.productCode = params['productCode'];
            this.sharedService.masterDropdowns$.pipe(takeUntil(this.destroy$)).subscribe({
                next: (data) => {
                    if (data?.status && data?.data && data?.data?.atsViewMasterData?.wfList) {
                        console.log(data.data.atsViewMasterData.wfList)
                        this.applicationStatuses = data.data.atsViewMasterData.wfList
                        .map((item: any) => ({
                            id: item.id,
                            title: item.title.split(' - ')[0],
                        }));
                        // this.getApplicantDetails();
                        this.loadingSpinnerService.hide()
                        this.applicantDetails = this.dummyApplicantDetails;
                        this.notes = this.dummyApplicantDetails.notes;
                        this.questions = this.dummyApplicantDetails.questions;
                    }
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                    this.loadingSpinnerService.hide();
                },
            });
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getApplicantDetails() {
        const body = {
            resId: Number(this.resId),
            alertId: Number(this.alertId),
            productCode: Number(this.productCode)
        };
        console.log(body);
        this.apiService.getApplicationDetails(body).subscribe({
            next: (response) => {
                if (response.status) {
                    this.applicantDetails = response.data.list;
                    this.loadingSpinnerService.hide();
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            },
        });
    }

    getInitials(name: string): string {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    }

    getSeverity(status: string): any {
        switch (status) {
            case 'Review':
                return 'secondary';

            case 'Interview':
                return 'info';

            case 'Offer':
                return 'primary';

            case 'Onboarding':
                return 'warning';

            case 'Joined':
                return 'success';

            default:
                return '';
        }
    }

    copyToClipboard(value: string): void {
        navigator.clipboard.writeText(value).then(() => {
          console.log(`${value} copied to clipboard`);
        });
    }

    onStatusChange(event: any): void {
        this.showConfirmation = true;
    }

    cancelStatusChange(): void {
        this.selectedStatus = this.currentStatus; // Revert to the current status
        this.showConfirmation = false;
        console.log(this.showConfirmation);
    }

    confirmStatusChange(): void {
        if (this.selectedStatus) {
            // Mock API call to update the status
            this.updateApplicationStatus(this.selectedStatus, this.note);
            this.showConfirmation = false;
        }
    }

    updateApplicationStatus(statusTitle: string, note: string): void {
        // Replace this with your actual API call
        console.log('Updated Status:', statusTitle, 'Note:', note);

        this.currentStatus = statusTitle;
        this.messageService.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: 'Application status updated successfully.',
        });

        this.note = '';
    }

    isSubmitDisabled(): boolean {
        return this.note.trim() === '';
    }
    
    submitNote(): void {
        console.log('Note Submitted:', this.note);
    }

    formatExperience(experience: string | number): string {
        const experienceNum = parseFloat(experience?.toString());
        return experienceNum % 1 === 0 ? experienceNum.toFixed(0) : experienceNum.toString();
    }

    getSkills(skills: string) {
        const skillsArray = JSON.parse(skills);
        return skillsArray?.length > 0 ? skillsArray.map((item: any) => item.title) : [];
    }
}
