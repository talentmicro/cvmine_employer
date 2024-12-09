import { Component } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { LoadingService } from './common/loading-spinner/loading.service';
import { LoadingSpinnerComponent } from './common/loading-spinner/loading-spinner.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { FooterComponent } from './common/footer/footer.component';
import { BackToTopComponent } from './common/back-to-top/back-to-top.component';

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
export class AppComponent {
    isLoading = false;
    title = 'CVMine Employer Portal';

    constructor (
        private router: Router,
        private viewportScroller: ViewportScroller,
        private loadingService: LoadingService
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
        
        this.loadingService.loading$.subscribe((loading) => {
            this.isLoading = loading;
        });
    }

}