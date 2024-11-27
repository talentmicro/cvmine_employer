import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
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

    constructor (
        public router: Router,
    ) {}

    ngOnInit(): void {
        this.isLoggedIn = this.loginService.isLoggedIn();
        if (this.isLoggedIn) {
            const userDetails = this.loginService.getUserDetails();
            this.userName = userDetails?.displayName || 'User';
        }

        // this.loginService.loginState$
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((state) => {
        //         console.log(state);
        //         this.isLoggedIn = state;
        //         if (state) {
        //             const userDetails = this.loginService.getUserDetails();
        //             this.userName = userDetails?.name || 'User';
        //         } else {
        //             this.userName = 'Guest';
        //         }
        // });
    }

    toggleUserDropdown(): void {
        this.userDropdownOpen = !this.userDropdownOpen;
    }
    
    logout(): void {
        this.loginService.logout();
        this.router.navigate(['/login']);
    }
    
    ngOnDestroy(): void {
        // Unsubscribe to prevent memory leaks
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Navbar Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    // Menu Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

    // Notifications Dropdown
    notificationsDropdownClassApplied = false;
    notificationsDropdownToggleClass() {
        this.notificationsDropdownClassApplied = !this.notificationsDropdownClassApplied;
    }

    openSectionIndex: number = -1;
    openSectionIndex2: number = -1;
    openSectionIndex3: number = -1;
    toggleSection(index: number): void {
        if (this.openSectionIndex === index) {
            this.openSectionIndex = -1;
        } else {
            this.openSectionIndex = index;
        }
    }
    toggleSection2(index: number): void {
        if (this.openSectionIndex2 === index) {
            this.openSectionIndex2 = -1;
        } else {
            this.openSectionIndex2 = index;
        }
    }
    toggleSection3(index: number): void {
        if (this.openSectionIndex3 === index) {
            this.openSectionIndex3 = -1;
        } else {
            this.openSectionIndex3 = index;
        }
    }
    isSectionOpen(index: number): boolean {
        return this.openSectionIndex === index;
    }
    isSectionOpen2(index: number): boolean {
        return this.openSectionIndex2 === index;
    }
    isSectionOpen3(index: number): boolean {
        return this.openSectionIndex3 === index;
    }


}