import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopHeaderComponent } from '../../common/top-header/top-header.component';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-job-details-two-page',
    standalone: true,
    imports: [RouterLink, NgIf, TopHeaderComponent, NavbarComponent, PageBannerComponent, FooterComponent, BackToTopComponent],
    templateUrl: './job-details-two-page.component.html',
    styleUrl: './job-details-two-page.component.scss'
})
export class JobDetailsTwoPageComponent {}