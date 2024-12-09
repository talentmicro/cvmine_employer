import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { ApiService } from '../services/api.service';
import { MessageService } from 'primeng/api';
import { ImportsModule } from '../../imports';
import { Table } from 'primeng/table';

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

export class JobApplicantsPageComponent implements OnInit {
    @ViewChild('dt2') dt2!: Table;
    jobCode?: string;
    status?: string;
    applicantsList: Applicant[] = [];
    jobsList: Array<{ job_code: string; job_name: string }> = [];
    page = 1;
    pageSize = 10;
    currentPage = 0;
    searchText: string = '';
    applicationStatus: Array<{ statusCode: number; label: string }> = [];

    requestBody = {
        "sellerCode": [],
        "search": null,
        "productCode": [
            
        ],
        "statusCode": [],
        "startPage": 1,
        "limit": 40,
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

    constructor(
        private route: ActivatedRoute,
        private loadingSpinnerService: LoadingService,
        private apiService: ApiService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.jobCode = params['jobCode'];
            this.status = params['status'];
            this.getDropdownValues();
        });
    }

    getApplicants(): void {
        this.loadingSpinnerService.show();
        this.apiService.getApplicants(this.requestBody).subscribe({
            next: (response) => {
                if (response.status && response.data && response.data.list) {
                    this.loadingSpinnerService.hide();
                    this.applicantsList = response.data.list.map((item: any) => ({
                        application_id: item.prodResId,
                        job_code: item.productCode,
                        applicant_name: item.fullName,
                        applicant_email: item.emailId,
                        applicant_phone: item.mobileNumber,
                        application_date: item.deliveryDate,
                        experience_in_years: 'No Prop',
                        location: item.presentLocation,
                        status: item.statusCode,
                        skills: ['Test1', 'No Prop', 'Etc'],
                        alertId: item.alertId,
                        resId: item.resId
                    }));
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            },
        });
    }

    getDropdownValues(): void {
        const body = {};
        this.loadingSpinnerService.show();
        this.apiService.getDropdownsData(body).subscribe({
            next: (response) => {
                if (response.status && response.data && response.data.atsViewMasterData.wfList) {
                    this.loadingSpinnerService.hide();
                    this.applicationStatus = response.data.atsViewMasterData.wfList
                    .map((item: any) => ({
                        statusCode: item.id,
                        label: item.title.split(' - ')[0],
                    }));
                    this.getApplicants();
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            },
        });
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

    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        this.dt2.filterGlobal(input.value, 'contains');
    }

    onStatusChange(row: Applicant): void {
        this.loadingSpinnerService.show();
        let body1 = {
            "resId": row.resId,
            "alertId": row.alertId,
            "productCode": row.job_code
        };

        this.apiService.getApplicationDetails(body1).subscribe({
            next: (response: any) => {
                let body2 = {
                    "alertId": [
                        row.alertId
                    ],
                    "stageCode": response.data.resumeDetails.stageCode,
                    "statusCode": row.status
                }
                this.apiService.changeApplicantionStatus(body2).subscribe({
                    next: (response: any) => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                        this.getApplicants();
                    },
                    error: (error: any) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                        this.loadingSpinnerService.hide();
                    }
                })
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
            }
        });
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
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true
        };
        const formattedDate = date.toLocaleString('en-GB', options).replace(',', '');
        return formattedDate;
    }
}