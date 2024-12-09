import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { ImportsModule } from '../../imports';
import { applicantStatus } from '../data';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-applicant-details-page',
    templateUrl: './applicant-details-page.component.html',
    styleUrl: './applicant-details-page.component.scss',
    standalone: true,
    imports: [
        RouterLink, 
        NavbarComponent,
        FooterComponent, 
        BackToTopComponent,
        ImportsModule
    ],
    providers: [MessageService]
})

export class ApplicantDetailsPageComponent {
    applicantDetails: any = {};
    applicationStatuses: any = [];
    notes: any = [];
    questions: any = [];
    dummyApplicants = [
        {
            jobId: 1,
            jobName: "Senior Software Engineer",
            jobCode: "J001",
            applicantName: "John Doe",
            email: "johndoe@example.com",
            phoneNumber: "+1234567890",
            location: "New York, USA",
            jobType: "Full Time - Regular",
            skills: ["Angular", "TypeScript", "Node.js"],
            experience: "Between 3 to 5 years",
            noticePeriod: "Immediate Joinee",
            applicationStatus: "Interview",
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
        },
    ];
    selectedStatus: string | null = null;
    currentStatus: string = '';
    note: string = '';
    showConfirmation: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        const id : any = this.route.snapshot.paramMap.get("id");

        // Simulate fetching applicant details
        this.applicantDetails = this.dummyApplicants.find(
            (applicant) => applicant.jobId === +id
        );
        this.applicationStatuses = applicantStatus;
        this.currentStatus = this.applicantDetails.applicationStatus;
        this.selectedStatus = this.currentStatus;
        this.notes = this.applicantDetails.notes;
        this.questions = this.applicantDetails.questions;
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
}
