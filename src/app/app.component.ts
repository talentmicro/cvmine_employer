import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { LoadingService } from './common/loading-spinner/loading.service';
import { LoadingSpinnerComponent } from './common/loading-spinner/loading-spinner.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { FooterComponent } from './common/footer/footer.component';
import { BackToTopComponent } from './common/back-to-top/back-to-top.component';
import { SharedService } from './pages/services/shared.service';
import { LoginService } from './pages/services/auth/login.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: true,
    imports: [
        RouterOutlet,
        NavbarComponent,
        FooterComponent,
        BackToTopComponent,
        LoadingSpinnerComponent,
        CommonModule
    ],
})
export class AppComponent implements OnInit {
    isLoading = false;
    title = 'CVMine Employer Portal';

    constructor (
        private router: Router,
        private viewportScroller: ViewportScroller,
        private loadingService: LoadingService,
        private sharedService: SharedService,
        private loginService: LoginService,
        private cdr: ChangeDetectorRef
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
    }

    ngOnInit(): void {
        this.loginService.loginState$.subscribe((isLoggedIn) => {
            if (isLoggedIn) {
                this.sharedService.fetchAndSetDropdownData({});
            }
        });
    }

    ngAfterViewInit() {
        this.loadingService.loading$.subscribe((loading) => {
            this.isLoading = loading;
            this.cdr.detectChanges();
        });
    }

}