import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { jobListings } from '../job-listings-page/job-listings';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';

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
    selector: 'app-job-listings-page',
    templateUrl: './job-listings-page.component.html',
    styleUrls: ['./job-listings-page.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatOptionModule,
        MatInputModule
    ]
})
export class JobListingsPageComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'job_name', 'total_applications', 'shortlisted_applications', 
        'interviewed_applications', 'offered_applications', 'hired_applications',
        'dropped_applications', 'status', 'options'
    ];
    dataSource!: MatTableDataSource<Job>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    jobsList: Job[] = [];
    page = 1;
    pageSize = 10;
    currentPage = 0;
    searchText: string = '';
    jobStatuses: Array<{ value: string; label: string }> = [
        { value: 'pending', label: 'Pending' },
        { value: 'published', label: 'Published' },
        { value: 'paused', label: 'Paused' },
        { value: 'closed', label: 'Closed' }
    ];
    selectedStatus: string = '';

    constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

    ngOnInit(): void {
        this.getPayouts();
    }

    ngAfterViewInit(): void {
        if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }
    }

    getPayouts(): void {
        this.jobsList = jobListings;
        this.dataSource = new MatTableDataSource(this.jobsList);

        setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    filterByStatus(status: string): void {
        this.dataSource.filterPredicate = (data: Job, filter: string) => {
            if (!filter) return true;
            return data.status.toLowerCase() === filter.toLowerCase();
        };
    
        this.dataSource.filter = status;
    }

    onStatusChange(row: Job): void {
        console.log(`Job ID ${row.id} status changed to: ${row.status}`);
    
        // Optional: Call an API to persist the change
        // this.http.put(`api/jobs/${row.id}`, { status: row.status }).subscribe(
        //     (response) => console.log('Status updated', response),
        //     (error) => console.error('Error updating status', error)
        // );
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

    updateJobStatus(jobId: number, status: string): void {
        this.http.put(`api/jobs/${jobId}`, { status }).subscribe(
            (response) => console.log('Status updated successfully', response),
            (error) => console.error('Error updating status', error)
        );
    }

    pageChanged(event: PageEvent): void {
        // console.log(event);
        // const startIndex = event.pageIndex * event.pageSize;
        // const endIndex = startIndex + event.pageSize;
        // this.dataSource = new MatTableDataSource(this.jobsList.slice(startIndex, endIndex));
        console.log('Page changed:', event);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
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