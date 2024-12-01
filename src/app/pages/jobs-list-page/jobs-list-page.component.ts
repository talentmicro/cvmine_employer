import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { jobListings } from '../job-listings-page/job-listings';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImportsModule } from '../../imports';

// prime-ng imports
import { Table } from 'primeng/table';
import { ApiService } from '../services/api.service';
import { LoadingService } from '../../common/loading-spinner/loading.service';
import { MessageService } from 'primeng/api';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';

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
        NavbarComponent, 
        FooterComponent, 
        BackToTopComponent,
        FormsModule,
        ReactiveFormsModule,
        ImportsModule
    ],
    providers: [MessageService]
})

export class JobsListPageComponent {
    @ViewChild('dt2') dt2!: Table;
    jobsList: Job[] = [];
    selectedJobs!: Job;
    expandedRows = {};
    // jobStatuses: Array<{ value: string; label: string }> = [
    //     { value: 'pending', label: 'Pending' },
    //     { value: 'published', label: 'Published' },
    //     { value: 'paused', label: 'Paused' },
    //     { value: 'closed', label: 'Closed' }
    // ];
    jobStatuses: Array<{ value: string; label: string, status: number; statusTitle: string }> = []
    loading: boolean = true;
    formGroup!: FormGroup;
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
        private apiService: ApiService,
        private loadingSpinnerService: LoadingService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.getAllJobListings();
        this.getDropdownValues();
    }

    getAllJobListings(): void {
        this.loadingSpinnerService.show();
        this.apiService.getJobListings(this.requestBody).subscribe({
            next: (response) => {
                console.log(response);
                if (response.status && response.data && response.data.list) {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.loading = false;
                    this.loadingSpinnerService.hide();
                    this.jobsList = response.data.list.map((item: any) => ({
                        id: item.productCode,
                        job_code: item.productCode,
                        job_name: item.productName,
                        location: item.jobLocation,
                        total_applications: item.totalResCount,
                        shortlisted_applications: item.Shortlist || 0,
                        interviewed_applications: item.Interview || 0,
                        offered_applications: item.Offer || 0,
                        hired_applications: item.joined || 0,
                        dropped_applications: item.AllDropped || 0,
                        published_date: item.postedOn,
                        status: item.statusTitle,
                    }));
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loading = false;
                this.loadingSpinnerService.hide();
            },
        });
    }

    getDropdownValues(): void {
        const body = {};
        this.apiService.getDropdownsData(this.requestBody).subscribe({
            next: (response) => {
                if (response.status && response.data && response.data.jobMasterData.jobStatusList) {
                    this.jobStatuses = response.data.jobMasterData.jobStatusList
                    .filter((item: any) => item.status !== 10)
                    .map((item: any) => ({
                        status: item.status,
                        statusTitle: item.statusTitle,
                        value: item.statusTitle.toLowerCase(),
                        label: item.statusTitle
                    }));
                    console.log(this.jobStatuses);
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loading = false;
                this.loadingSpinnerService.hide();
                console.error('Error fetching job data:', error);
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
        this.messageService.add({ severity: 'info', summary: 'Job Expanded', detail: event.data.name, life: 3000 });
    }

    onRowCollapse(event: TableRowCollapseEvent) {
        this.messageService.add({ severity: 'success', summary: 'Job Collapsed', detail: event.data.name, life: 3000 });
    }


    ngAfterViewInit(): void {
        
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
        console.log(`Job ID ${row.id} status changed to: ${row.status}`);
    
        // Optional: Call an API to persist the change
        // this.http.put(`api/jobs/${row.id}`, { status: row.status }).subscribe(
        //     (response) => console.log('Status updated', response),
        //     (error) => console.error('Error updating status', error)
        // );
    }

    formatPublishedDate(dateString: string): string {
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