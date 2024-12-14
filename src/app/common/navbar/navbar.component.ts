import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoginService } from '../../pages/services/auth/login.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, NgClass, RouterLinkActive, NgIf],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
    private loginService = inject(LoginService);
    isLoggedIn: boolean = false;
    userName: string = 'Guest';
    private destroy$ = new Subject<void>();
    userDropdownOpen: boolean = false;
    classApplied = false;
    isSticky: boolean = false;
    notificationsDropdownClassApplied = false;

    constructor(
        public router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loginService.loginState$
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (state) => {
                    console.log('Navbar: Detected loginState$ change:', state);
                    this.isLoggedIn = state;

                    if (state) {
                        const userDetails = this.loginService.getUserDetails();
                        this.userName = userDetails?.displayName || 'User';
                    } else {
                        this.userName = 'Guest';
                    }
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Navbar: Error in loginState$ subscription:', err);
                }
            });
    }

    toggleUserDropdown(): void {
        this.userDropdownOpen = !this.userDropdownOpen;
    }
    
    logout(): void {
        this.userDropdownOpen = !this.userDropdownOpen;
        this.classApplied = !this.classApplied
        this.loginService.logout();
        this.router.navigate(['/login']);
    }
    
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    toggleClass() {
        this.classApplied = !this.classApplied;
    }

    notificationsDropdownToggleClass() {
        this.notificationsDropdownClassApplied = !this.notificationsDropdownClassApplied;
    }

    openSectionIndex: number = -1;
    openSectionIndex2: number = -1;
    openSectionIndex3: number = -1;

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;

        const clickedInsideUserDropdown = target.closest('.user-icon');
        const clickedInsideNotificationsDropdown = target.closest('.notif-option');

        if (!clickedInsideUserDropdown) {
            this.userDropdownOpen = false;
        }

        if (!clickedInsideNotificationsDropdown) {
            this.notificationsDropdownClassApplied = false;
        }

        this.cdr.detectChanges();
    }

}