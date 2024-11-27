import { Routes } from '@angular/router';
import { HomeDemoOneComponent } from './demos/home-demo-one/home-demo-one.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { JobsListPageComponent } from './pages/jobs-list-page/jobs-list-page.component';
import { JobListingsPageComponent } from './pages/job-listings-page/job-listings-page.component';
import { JobApplicantsPageComponent } from './pages/job-applicants-page/job-applicants-page.component';
import { JobPostingPageComponent } from './pages/job-posting-page/job-posting-page.component';
import { authGuard, redirectIfAuthenticatedGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginPageComponent, canActivate: [redirectIfAuthenticatedGuard] },
    { path: 'dashboard', component: HomeDemoOneComponent, canActivate: [authGuard] },
    { path: 'jobs-list', component: JobsListPageComponent, canActivate: [authGuard] },
    { path: 'job-listings', component: JobListingsPageComponent, canActivate: [authGuard] },
    { path: 'job-applicants', component: JobApplicantsPageComponent, canActivate: [authGuard] },
    {
        path: 'job',
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'add', pathMatch: 'full' },
            { path: 'add', component: JobPostingPageComponent },
            { path: 'edit/:id', component: JobPostingPageComponent },
        ],
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: ErrorPageComponent }
];
