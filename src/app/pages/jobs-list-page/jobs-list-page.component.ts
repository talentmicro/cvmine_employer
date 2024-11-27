import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { jobListings } from '../job-listings-page/job-listings';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ImportsModule } from '../../imports';

// prime-ng imports
import { Table } from 'primeng/table';

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
        ImportsModule
    ],
})

export class JobsListPageComponent {
    @ViewChild('dt2') dt2!: Table;
    jobsList: Job[] = [];
    jobStatuses: Array<{ value: string; label: string }> = [
        { value: 'pending', label: 'Pending' },
        { value: 'published', label: 'Published' },
        { value: 'paused', label: 'Paused' },
        { value: 'closed', label: 'Closed' }
    ];
    loading: boolean = true;

    constructor(
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        this.getAllJobListings();
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

    getAllJobListings(): void {
        this.jobsList = jobListings;
        this.loading = false;
    }
    
    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'pending';
            case 'published':
                return 'published';
            case 'paused':
                return 'paused';
            case 'closed':
                return 'closed';
            default:
                return '';
        }
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