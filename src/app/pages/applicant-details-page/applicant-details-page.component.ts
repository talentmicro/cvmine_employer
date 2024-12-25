import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportsModule } from '../../imports';
import { MessageService } from 'primeng/api';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { SharedService } from '../services/shared.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../services/api.service';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@Component({
    selector: 'app-applicant-details-page',
    templateUrl: './applicant-details-page.component.html',
    styleUrl: './applicant-details-page.component.scss',
    standalone: true,
    imports: [
        ImportsModule,
        NgxDocViewerModule
    ],
    providers: [MessageService]
})

export class ApplicantDetailsPageComponent {
    applicantDetails: any = {};
    encryptedQueryParamsString?: string;
    queryParamsString?: string;
    resId!: number;
    alertId!: number;
    productCode!: number;
    applicationStatuses: any = [];
    jobTypes: any[] = [];
    notes: any = [];
    // questions: any = [];
    selectedStatus: string | null = null;
    currentStatus: string = '';
    note: string = '';
    showConfirmation: boolean = false;
    fileUrl: string = '';
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
            this.encryptedQueryParamsString = params['q'];
            if(this.encryptedQueryParamsString) {
                this.queryParamsString = this.sharedService.decrypt(this.encryptedQueryParamsString);
                const queryParams = JSON.parse(this.queryParamsString);
                this.resId = Number(queryParams?.resId);
                this.alertId = Number(queryParams?.alertId);
                this.productCode = Number(queryParams?.productCode);
            }
            this.sharedService.masterDropdowns$.pipe(takeUntil(this.destroy$)).subscribe({
                next: (data) => {
                    if (data?.status && data?.data && data?.data?.atsViewMasterData?.wfList) {
                        this.applicationStatuses = data.data.atsViewMasterData.wfList
                        .map((item: any) => ({
                            statusCode: item.id,
                            status: item.title.split(' - ')[0],
                        }));
                        this.jobTypes = data?.data && data?.data?.resumeMasterData?.jobTypeList;
                        this.getApplicantDetails();
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
        // console.log(body);
        this.apiService.getApplicationDetails(body).subscribe({
            next: (response) => {
                if (response.status) {
                    // console.log(response);
                    this.applicantDetails = {
                        "firstName": response?.data?.resumeDetails?.firstName,
                        "lastName": response?.data?.resumeDetails?.lastName,
                        "fullName": response?.data?.resumeDetails?.firstName + ' ' + response?.data?.resumeDetails.lastName,
                        "nameInitials": this.getInitials(response?.data?.resumeDetails?.firstName + ' ' + response?.data?.resumeDetails.lastName),
                        "position": response?.data?.requirementSummary?.productName,
                        "status": response?.data?.resumeDetails?.statusTitle,
                        "statusCode": response?.data?.resumeDetails?.statusCode,
                        "stageCode": response?.data?.resumeDetails?.stageCode,
                        "emailId": response?.data?.resumeDetails.emailId,
                        "mobile": response?.data?.resumeDetails?.mobileIsd + ' ' + response?.data?.resumeDetails?.mobileNumber,
                        "location": response?.data?.resumeDetails?.presentLocation,
                        "jobTypes": this.getJobTypes(response?.data?.resumeDetails?.jobType),
                        "experience": this.formatExperience(response?.data?.resumeDetails?.totalExp),
                        "noticePeriod": response?.data?.resumeDetails?.noticePeriod,
                        "keySkills": this.getSkills(response?.data?.resumeDetails?.keySkills),
                        "originalCVPath": response?.data?.resumeDetails?.originalCVPath
                    };
                    this.currentStatus =this.applicantDetails.statusCode;
                    this.fileUrl = 'https://storage.googleapis.com/ezeone/icanrefer/' + this.applicantDetails.originalCVPath;
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.getNotes({type: 401, refId: this.alertId});
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            },
        });
    }

    getNotes(body: any) {
        this.loadingSpinnerService.show();
        this.apiService.getNotes(body).subscribe({
            next: (response) => {
                if(response.status) {
                    this.notes = response?.data?.list;
                    this.loadingSpinnerService.hide();
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                    this.loadingSpinnerService.hide();
                }
                
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            }
        })
    }

    getViewerType(fileUrl: string) {
        if (fileUrl.endsWith('.pdf')) {
            return 'google';
        } else if (fileUrl.endsWith('.doc') || fileUrl.endsWith('.docx')) {
            return 'office';
        } else {
            return 'google';
        }
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
            case 'Dropped':
                return 'danger';
            default:
                return '';
        }
    }

    copyToClipboard(value: string): void {
        navigator.clipboard.writeText(value).then(() => {
            // this.messageService.add({ severity: 'success', summary: 'Success', detail: "Copied!" });
        });
    }

    onStatusChange(event: any): void {
        this.note = '';
        this.selectedStatus = event.value;
        this.showConfirmation = true;
    }

    cancelStatusChange(): void {
        this.note = '';
        this.showConfirmation = false;
    }

    confirmStatusChange(): void {
        if (this.selectedStatus && this.selectedStatus != this.currentStatus) {
            this.loadingSpinnerService.show();
            let body = {
                "alertId": [
                    Number(this.alertId)
                ],
                "stageCode": this.applicantDetails?.stageCode,
                "statusCode": this.selectedStatus
            }
            // console.log(body)
            this.apiService.changeApplicantionStatus(body).subscribe({
                next: (response: any) => {
                    this.loadingSpinnerService.hide();
                    if(this.note) {
                        const notebody = {
                            "type": 401,
                            "refId": this.alertId,
                            "heading": "Recruiter Notes",
                            "view_type": 2,
                            "notes": this.note,
                            "id": null,
                            "deleted": null
                        }
                        this.apiService.saveNotes(notebody).subscribe({
                            next: (response) => {
                                if(response.status) {
                                    this.note = '';
                                    this.showConfirmation = false;
                                    this.getApplicantDetails();
                                } else {
                                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                                    this.loadingSpinnerService.hide();
                                }
                            },
                            error: (error: any) => {
                                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                                this.loadingSpinnerService.hide();
                            }
                        }) 
                    } else {
                        this.getApplicantDetails();
                    }
                },
                error: (error: any) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                    this.loadingSpinnerService.hide();
                }
            })
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Invalid', detail: 'The status is same as current.' });
        }
    }

    isSubmitDisabled(): boolean {
        return this.note.trim() === '';
    }
    
    submitNote(): void {
        this.loadingSpinnerService.show();
        const body = {
            "type": 401,
            "refId": this.alertId,
            "heading": "Recruiter Notes",
            "view_type": 2,
            "notes": this.note,
            "id": null,
            "deleted": null
        }
        this.apiService.saveNotes(body).subscribe({
            next: (response) => {
                if(response.status) {
                    this.note = '';
                    this.getNotes({type: 401, refId: this.alertId});
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                    this.loadingSpinnerService.hide();
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            }
        })
    }

    formatExperience(experience: string | number): string {
        const experienceNum = parseFloat(experience.toString());
        if(experienceNum == 0) {
            return 'Fresher'
        }
        return experienceNum % 1 === 0 ? experienceNum.toFixed(0) + ' years' : experienceNum.toString() + ' years';
    }

    getSkills(skills: string) {
        const skillsArray = JSON.parse(skills);
        return skillsArray?.length > 0 ? skillsArray.map((item: any) => item.title) : [];
    }

    getJobTypes(jobTypesString: string) {
        const jobTypesArray = JSON.parse(jobTypesString);
        if(jobTypesArray?.length > 0) {
            const jobTypeTitles = this.jobTypes.filter(item => jobTypesArray.includes(item.jobType)).map(item => item.title);
            return jobTypeTitles.join(', ')
        } else {
            return 'Not Selected'
        }
    }
}
