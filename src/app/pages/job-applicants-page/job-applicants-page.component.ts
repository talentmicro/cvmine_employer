import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
// import { jobApplicants } from './job-applicants';
// import { jobListings } from '../job-listings-page/job-listings';
// import { HttpClient } from '@angular/common/http';
// import { MatTableModule } from '@angular/material/table';
// import { MatSortModule } from '@angular/material/sort';
// import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatSelectModule } from '@angular/material/select';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatOptionModule } from '@angular/material/core';
// import { MatInputModule } from '@angular/material/input';
// import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
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
        NavbarComponent,
        FooterComponent,
        BackToTopComponent,
        ImportsModule
    ],
    providers: [MessageService]
})

export class JobApplicantsPageComponent implements OnInit {
    @ViewChild('dt2') dt2!: Table;
    jobCode?: string;
    status?: string;
    // displayedColumns: string[] = [
    //     'applicant_name', 'application_date', 'experience_in_years', 
    //     'skills', 'location', 'status'
    // ];
    // dataSource!: MatTableDataSource<Applicant>;
    // @ViewChild(MatPaginator) paginator!: MatPaginator;
    // @ViewChild(MatSort) sort!: MatSort;
    applicantsList: Applicant[] = [];
    jobsList: Array<{ job_code: string; job_name: string }> = [];
    page = 1;
    pageSize = 10;
    currentPage = 0;
    searchText: string = '';
    applicationStatus: Array<{ statusCode: number; label: string }> = [];
    // applicationStatus: Array<{ value: number; text: string }> = [
    //     { value: 1, text: 'Applied' },
    //     { value: 2, text: 'Shortlisted' },
    //     { value: 3, text: 'Interviewed' },
    //     { value: 4, text: 'Offered' },
    //     { value: 5, text: 'Hired' },
    //     { value: 6, text: 'Dropped' }
    // ];
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
            
            // this.getApplicants();
            this.getDropdownValues();
        });
        // this.filteredJobs = this.jobSearchControl.valueChanges.pipe(
        //     startWith(''),
        //     map((value) => this.filterJobs(value || ''))
        // );
    }

    getApplicants(): void {
        this.loadingSpinnerService.show();
        this.apiService.getApplicants(this.requestBody).subscribe({
            next: (response) => {
                console.log(response);
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
                        skills: ['Test1', 'No Prop', 'Etc']
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
        this.apiService.getDropdownsData(this.requestBody).subscribe({
            next: (response) => {
                if (response.status && response.data && response.data.atsViewMasterData.wfList) {
                    this.loadingSpinnerService.hide();
                    this.applicationStatus = response.data.atsViewMasterData.wfList
                    .map((item: any) => ({
                        statusCode: item.id,
                        label: item.title.split(' - ')[0],
                    }));
                    console.log(this.applicationStatus);
                    this.getApplicants();
                }
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                this.loadingSpinnerService.hide();
                console.error('Error fetching job data:', error);
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

    // getApplicants(): void {
    //     if (this.jobCode && this.status) {
    //         this.applicantsList = jobApplicants.filter((applicant) =>
    //             applicant.job_code === this.jobCode && applicant.status.toLowerCase() === this.status?.toLowerCase()
    //         );
    //     } else if (this.jobCode) {
    //         this.applicantsList = jobApplicants.filter((applicant) => 
    //             applicant.job_code === this.jobCode
    //         );
    //     } else {
    //         this.applicantsList = jobApplicants;
    //     }
    //     this.dataSource = new MatTableDataSource(this.applicantsList);

    //     setTimeout(() => {
    //         this.dataSource.paginator = this.paginator;
    //         this.dataSource.sort = this.sort;
    //     });
    // }

    // getJobs() {
    //     this.jobsList =jobListings.map(job => ({
    //         job_code: job.job_code,
    //         job_name: job.job_name
    //     }));
    //     if (this.jobCode) {
    //         const matchingJob = this.jobsList.find((job) => job.job_code === this.jobCode);
    //         if (matchingJob) {
    //             this.jobSearchControl.setValue(matchingJob);
    //             console.log(this.jobSearchControl.value);
    //         }
    //     }

    //     if (this.status) {
    //         this.selectedStatus = this.status.charAt(0).toUpperCase() + this.status.slice(1);
    //     }
    // }

    // private filterJobs(search: any): { job_code: string; job_name: string }[] {
    //     let lowerCaseSearch: string;
    //     if(typeof(search) == 'string') {
    //         lowerCaseSearch = search.toLowerCase();
    //     } else {
    //         lowerCaseSearch = search.job_name.toLowerCase();
    //     }
    //     return this.jobsList.filter((job) =>
    //         job.job_name.toLowerCase().includes(lowerCaseSearch)
    //     );
    // }

    // applyFilter(event: Event): void {
    //     const filterValue = (event.target as HTMLInputElement).value;
    //     this.dataSource.filter = filterValue.trim().toLowerCase();

    //     if (this.dataSource.paginator) {
    //         this.dataSource.paginator.firstPage();
    //     }
    // }

    // filterByStatus(status: string): void {
    //     this.dataSource.filterPredicate = (data: Applicant, filter: string) => {
    //         if (!filter) return true;
    //         return data.status.toLowerCase() === filter.toLowerCase();
    //     };
    
    //     this.dataSource.filter = status;
    // }

    // applyFilters(): void {
    //     // const jobCode = this.jobSearchControl.value || '';
    //     const jobSearchValue = this.jobSearchControl.value || '';
    //     const status = this.selectedStatus || '';
    //     this.filterByCriteria(status, jobSearchValue?.job_code);
    // }

    // filterByCriteria(status: string, jobCode: string): void {
    //     this.dataSource.filterPredicate = (data: Applicant, filter: string) => {
    //         const filterCriteria = JSON.parse(filter);
    //         const matchesStatus =
    //             !filterCriteria.status || data.status.toLowerCase() === filterCriteria.status.toLowerCase();
    //         const matchesJobCode =
    //             !filterCriteria.jobCode || data.job_code.toLowerCase().includes(filterCriteria.jobCode.toLowerCase());
    //         return matchesStatus && matchesJobCode;
    //     };
      
    //     this.dataSource.filter = JSON.stringify({
    //         status: status || '',
    //         jobCode: jobCode || ''
    //     });
    // }

    // displayJob(job: { job_name: string; job_code: string }): string {
    //     return job ? `${job.job_name} - (${job.job_code})` : '';
    // }

    onStatusChange(row: Applicant): void {
        console.log(`Job ID ${row.application_id} status changed to: ${row.status}`);
    
        // Optional: Call an API to persist the change
        // this.http.put(`api/jobs/${row.id}`, { status: row.status }).subscribe(
        //     (response) => console.log('Status updated', response),
        //     (error) => console.error('Error updating status', error)
        // );
    }

    // searchByApplicantName(){
    //     console.log(this.applicantSearchControl.value);
    // }
    
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

    // updateApplicationStatus(application_id: string, status: string): void {
    //     this.http.put(`api/jobs/${application_id}`, { status }).subscribe(
    //         (response) => console.log('Status updated successfully', response),
    //         (error) => console.error('Error updating status', error)
    //     );
    // }

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