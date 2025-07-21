import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImportsModule } from '../../imports';
import { Table } from 'primeng/table';
import { ApiService } from '../services/api.service';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { MessageService } from 'primeng/api';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { SharedService } from '../services/shared.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Subject, takeUntil } from 'rxjs';
import { jsonParse } from '../../functions/shared-functions';
import { SharedModule } from '../../shared-module/shared/shared.module';

interface Job {
    id: number;
    job_code: string;
    job_name: string;
    location: string;
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
    selector: 'app-jobs-list-page',
    templateUrl: './jobs-list-page.component.html',
    styleUrl: './jobs-list-page.component.scss',
    standalone: true,
    imports: [
        RouterLink,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ImportsModule,
        FloatLabelModule,
        SharedModule
    ],
    providers: [MessageService]
})

export class JobsListPageComponent implements OnInit, OnDestroy {
    @ViewChild('dt2') dt2!: Table;
    jobsList: Job[] = [];
    selectedJobs!: Job;
    expandedRows = {};
    private destroy$ = new Subject<void>();
    jobStatuses: Array<{ value: string; label: string, status: number; statusTitle: string }> = []
    loading: boolean = true;
    formGroup!: FormGroup;
    searchedKeyword: string = '';
    selectedStatuses: number[] = [];
    limit: number = 10;
    page: number = 1;
    totalRecords!: number;
    requestBody = {
        "search": "",
        "sellerCode": null,
        "fromDate": null,
        "toDate": null,
        "updatedFromDate": null,
        "updatedToDate": null,
        "publishingType": null,
        "startPage": 1,
        "limit": 10,
        "productCode": [],
        "status": null,
        "dateFilterType": null,
        "jobType": null,
    }
    isInitialLoad: boolean = true;

    constructor(
        private apiService: ApiService,
        private loadingSpinnerService: LoadingService,
        private messageService: MessageService,
        private sharedService: SharedService
    ) { }

    ngOnInit(): void {
        this.loadingSpinnerService.show();
        this.sharedService.masterDropdowns$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                if (data && data?.data?.jobMasterData && data?.data?.jobMasterData?.jobStatusList) {
                    this.jobStatuses = data.data.jobMasterData.jobStatusList
                        .filter((item: any) => item.status !== 10)
                        .map((item: any) => ({
                            status: item.status,
                            statusTitle: item.statusTitle,
                            value: item.statusTitle.toLowerCase(),
                            label: item.statusTitle,
                        }));
                    this.getAllJobListings();
                }
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loading = false;
                this.loadingSpinnerService.hide();
            },
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getAllJobListings(): void {
        const body = {
            ...this.requestBody,
            limit: this.limit,
            startPage: this.page
        }
        // console.log(body);
        this.apiService.getJobListings(body).subscribe({
            next: (response) => {
                // console.log(response);
                if (response.status && response.data && response.data.list) {
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.loading = false;
                    this.loadingSpinnerService.hide();
                    this.jobsList = response.data.list.map((item: any) => ({
                        id: item.productCode,
                        job_code: item.productCode,
                        job_name: item.productName,
                        location: jsonParse(item.prefJobseekerBranch),
                        total_applications: item.totalResCount,
                        shortlisted_applications: item.Screening || 0,
                        interviewed_applications: item.Interview || 0,
                        offered_applications: item.Offer || 0,
                        hired_applications: item.Joined || 0,
                        dropped_applications: item.Dropped || 0,
                        published_date: item.postedDate,
                        status: item.statusTitle,
                    }));
                    this.totalRecords = response?.data?.count;
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loading = false;
                this.loadingSpinnerService.hide();
            },
        });
    }

    clearSearch(): void {
        this.searchedKeyword = '';
    }

    clearSelectedStatuses(): void {
        this.selectedStatuses = [];
    }

    onSearch(): void {
        const requestBody = {
            ...this.requestBody,
            search: this.searchedKeyword.trim(),
            status: this.selectedStatuses.length > 0 ? this.selectedStatuses : null,
            limit: this.limit,
            startPage: this.page
        };
        this.loadingSpinnerService.show();
        this.apiService.getJobListings(requestBody).subscribe({
            next: (response) => {
                // console.log(response);
                if (response.status && response.data && response.data.list) {
                    this.jobsList = response.data.list.map((item: any) => ({
                        id: item.productCode,
                        job_code: item.productCode,
                        job_name: item.productName,
                        location: jsonParse(item.prefJobseekerBranch),
                        total_applications: item.totalResCount,
                        shortlisted_applications: item.Shortlist || 0,
                        interviewed_applications: item.Interview || 0,
                        offered_applications: item.Offer || 0,
                        hired_applications: item.joined || 0,
                        dropped_applications: item.AllDropped || 0,
                        published_date: item.postedDate,
                        status: item.statusTitle,
                    }));
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.totalRecords = response?.data?.count;
                    this.loading = false;
                    this.loadingSpinnerService.hide();
                }
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loading = false;
                this.loadingSpinnerService.hide();
            },
        });
    }

    expandAll() {
        // this.expandedRows = this.jobsList.reduce((acc: { [key: string]: boolean }, j) => (acc[j.id] = true) && acc, {});
        this.expandedRows = this.jobsList.reduce((acc, j) => {
            (acc as Record<number, boolean>)[j.id] = true;
            return acc;
        }, {});
    }

    collapseAll() {
        this.expandedRows = {};
    }

    onRowExpand(event: TableRowExpandEvent) {
        // this.messageService.add({ severity: 'info', summary: 'Job Expanded', detail: event.data.name, life: 3000 });
    }

    onRowCollapse(event: TableRowCollapseEvent) {
        // this.messageService.add({ severity: 'success', summary: 'Job Collapsed', detail: event.data.name, life: 3000 });
    }

    clear(table: Table) {
        table.clear();
    }

    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        this.dt2.filterGlobal(input.value, 'contains');
    }

    getSeverity(status: string): any {
        switch (status) {
            case 'closed':
                return 'danger';
            case 'published':
                return 'success';
            case 'pending':
                return 'info';
            case 'paused':
                return 'warning';
            default:
                return '';
        }
    }

    onJobStatusChange(row: Job): void {
        this.loadingSpinnerService.show();
        let body = {
            "status": this.jobStatuses.find(item => item.statusTitle === row.status)?.status,
            "productCode": row.id,
        }
        this.apiService.changeJobStatus(body).subscribe({
            next: (response) => {
                if (response.status) {
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    row.status = response.data.statusTitle;
                    this.loadingSpinnerService.hide();
                    // this.getAllJobListings();
                }
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.getAllJobListings();
            }
        })
    }

    formatPublishedDate(dateString: string): string {
        if (dateString) {
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

    formatLocations(locations: any[]) {
        const allLocations = locations.map(item => item.title);
        return allLocations.length > 0 ? allLocations : ['Unknown'];
    }

    // Get only first 2 locations for display
    getDisplayLocations(locations: any[]) {
        const allLocations = this.formatLocations(locations);
        return allLocations.slice(0, 2);
    }

    // Get remaining locations for tooltip
    getRemainingLocations(locations: any[]) {
        const allLocations = this.formatLocations(locations);
        return allLocations.slice(2);
    }

    // Check if there are more than 2 locations
    hasMoreLocations(locations: any[]) {
        const allLocations = this.formatLocations(locations);
        return allLocations.length > 2;
    }

    // Get tooltip text for remaining locations
    getLocationTooltip(locations: any[]) {
        const remaining = this.getRemainingLocations(locations);
        if (remaining.length > 0) {
            return `${remaining.join(', ')}`;
        }
        return '';
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
        this.onSearch();
        // this.getAllJobListings();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

}
