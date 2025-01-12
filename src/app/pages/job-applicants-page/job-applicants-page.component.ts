import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { ApiService } from '../services/api.service';
import { MessageService } from 'primeng/api';
import { ImportsModule } from '../../imports';
import { Table } from 'primeng/table';
import { SharedService } from '../services/shared.service';
import { jsonParse } from '../../functions/shared-functions';

interface Applicant {
    application_id: number;
    job_code: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string;
    application_date: string;
    experience_in_years: number;
    location: string;
    status: string;
    skills: string[];
    alertId: number;
    resId: number;
    stageCode: number;
}

@Component({
    selector: 'app-job-applicants-page',
    standalone: true,
    templateUrl: './job-applicants-page.component.html',
    styleUrls: ['./job-applicants-page.component.scss'],
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        ImportsModule
    ],
    providers: [MessageService]
})

export class JobApplicantsPageComponent implements OnInit, OnDestroy {
    @ViewChild('dt2') dt2!: Table;
    encryptedQueryParamsString?: string;
    queryParamsString?: string;
    jobCode?: string;
    status?: string;
    applicantsList: Applicant[] = [];
    jobsList: Array<{ job_code: string; job_name: string }> = [];
    limit: number = 10;
    page: number = 1;
    totalRecords!: number;
    searchText: string = '';
    applicationStatus: Array<{ statusCode: number; label: string }> = [];
    searchedKeyword: string = '';
    selectedJobs: number[] = [];
    selectedStatuses: number[] = [];
    onSearch: boolean = false;
    private destroy$ = new Subject<void>();
    requestBody = {
        "sellerCode": [],
        "search": null,
        "productCode": [
            
        ],
        "statusCode": [],
        "startPage": 1,
        "limit": 10,
        "reasons": null,
        "bookmarks": [],
        "sort": [],
        "fromDate": null,
        "toDate": null,
        "updatedFromDate": null,
        "updatedToDate": null,
        "dateFilterType": null,
        "publishingType": null,
        "type": null,
        "dateType": null,
        "userList": [],
        "dashboardId": null,
        "count": 0,
        "accessTypeId": null,
        "dashboard_filter": 0,
        "clientStatus": null,
        "clientList": [],
        "sourceType": [],
        "reqSourceType": [],
        "loadBalancerValue": null,
        "customFilter": [],
        "updatedBy": [],
        "metaTypeId": 0,
        "clientAM": null,
        "contactAM": null,
        "hiringManagers": null,
        "customers": null,
        "team": null,
        "projects": null,
        "sourceRef": null,
        "resumeExtendedData": null,
        "jobExtendedDataFilter": null,
        "showArchivedItems": null,
        "folders": null,
        "requirementType": null,
        "company": null,
        "sbuMis": null,
        "teamBucketing": null,
        "roles": null,
        "function": null,
        "lock_status": null,
        "campusTypes": null,
        "nationalities": null
    }
    filteredJobs!: Observable<{ job_code: string; job_name: string }[]>;
    isInitialLoad = true;

    constructor(
        private route: ActivatedRoute,
        private loadingSpinnerService: LoadingService,
        private apiService: ApiService,
        private messageService: MessageService,
        private sharedService: SharedService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.loadingSpinnerService.show()
            this.encryptedQueryParamsString = params['q'];
            if(this.encryptedQueryParamsString) {
                this.queryParamsString = this.sharedService.decrypt(this.encryptedQueryParamsString);
                const queryParams = jsonParse(this.queryParamsString);
                this.jobCode = queryParams?.jobCode;
                this.status = queryParams?.status;
            }
            
            this.sharedService.masterDropdowns$.pipe(takeUntil(this.destroy$)).subscribe({
                next: (data) => {
                    if (data?.status && data?.data && data?.data?.atsViewMasterData?.wfList) {
                        this.applicationStatus = data.data.atsViewMasterData.wfList
                        .map((item: any) => ({
                            statusCode: item.id,
                            label: item.title.split(' - ')[0],
                        }));
                        // this.getAllJobs();
                    }
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                    this.loadingSpinnerService.hide();
                },
            });
            this.getAllJobs();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getApplicants(): void {
        if(!this.onSearch && this.jobCode) {
            this.selectedJobs.push(Number(this.jobCode));
        }
        if(!this.onSearch && this.status) {
            this.selectedStatuses = this.applicationStatus
                .filter(status => status.label.toLowerCase() === this.status?.toLowerCase())
                .map(status => status.statusCode); 
        }
        const requestBody = {
            ...this.requestBody,
            search: this.searchedKeyword.trim(),
            productCode: this.selectedJobs.length > 0 ? this.selectedJobs : [],
            statusCode: this.selectedStatuses.length > 0 ? this.selectedStatuses : [],
            limit: this.limit,
            startPage: this.page
        };
        // console.log(requestBody);
        this.apiService.getApplicants(requestBody).subscribe({
            next: (response) => {
                // console.log(response);
                if (response.status && response.data && response.data.list) {
                    this.applicantsList = response.data.list.map((item: any) => ({
                        application_id: item.prodResId,
                        job_code: item.productCode,
                        applicant_name: item.fullName,
                        applicant_email: item.emailId,
                        applicant_phone: item.mobileNumber ? item.mobileNumber : 'N/A',
                        application_date: item.crDate,
                        experience_in_years: item.totalExp,
                        location: item.presentLocation,
                        status: item.statusCode,
                        skills: item.skills ? item.skills.split(',') : [],
                        alertId: item.alertId,
                        resId: item.resId,
                        stageCode: item.stageCode
                    }));
                    this.totalRecords = response?.data?.count;
                    this.loadingSpinnerService.hide();
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
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
                    this.getApplicants();
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching job data' });
                this.loadingSpinnerService.hide();
            },
        });
    }

    clearSearch(): void {
        this.searchedKeyword = '';
    }

    clearSelectedJobs(): void {
        this.selectedJobs = [];
    }

    clearSelectedStatuses(): void {
        this.selectedStatuses = [];
    }

    onSearchFilter() {
        this.onSearch = true;
        this.loadingSpinnerService.show();
        this.getApplicants();
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

    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        this.dt2.filterGlobal(input.value, 'contains');
    }

    onStatusChange(row: Applicant): void {
        this.loadingSpinnerService.show();
        let body2 = {
            "alertId": [
                row.alertId
            ],
            "stageCode": row.stageCode,
            "statusCode": row.status
        }
        // console.log(body2);
        this.apiService.changeApplicantionStatus(body2).subscribe({
            next: (response: any) => {
                // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                // console.log(response.data);
                // console.log(row);
                // row.status = response.data.statusCode;
                // this.loadingSpinnerService.hide();
                this.getApplicants();
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            }
        })
    }
    
    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'applied':
                return 'applied';
            case 'shortlisted':
                return 'shortlisted';
            case 'interviewed':
                return 'interviewed';
            case 'offered':
                return 'offered';
            case 'hired':
                return 'hired';
            case 'dropped':
                return 'dropped';
            default:
                return '';
        }
    }

    formatAppliedDate(dateString: string): string {
        if(dateString) {
            const utcDateString = dateString.replace(' ', 'T') + 'Z';
            var localDate = new Date(utcDateString);
            const options: Intl.DateTimeFormatOptions = { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true
            };
            const formattedDate = localDate.toLocaleString('en-GB', options).replace(',', '');
            return formattedDate;
        } else {
            return 'NA';
        }
    }

    formatExperience(experience: string | number): string {
        const experienceNum = parseFloat(experience.toString());
        if(experienceNum == 0) {
            return 'Fresher'
        }
        return experienceNum % 1 === 0 ? experienceNum.toFixed(0) + ' years' : experienceNum.toString() + ' years';
    }

    encryptQueryParams(queryParams: any) {
        const queryParamsString = JSON.stringify(queryParams);
        const encryptedQueryParamsString = this.sharedService.encrypt(queryParamsString);
        return encryptedQueryParamsString;
    }

    onPageChange(event: any): void {
        if (this.isInitialLoad) {
            this.isInitialLoad = false;
            return;
        }
        this.page = event.first / event.rows + 1;
        this.limit = event.rows;
        this.loadingSpinnerService.show();
        this.getApplicants();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}