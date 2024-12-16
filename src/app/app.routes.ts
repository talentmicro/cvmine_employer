import { Routes } from '@angular/router';
import { HomeDemoOneComponent } from './demos/home-demo-one/home-demo-one.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { JobsListPageComponent } from './pages/jobs-list-page/jobs-list-page.component';
import { JobApplicantsPageComponent } from './pages/job-applicants-page/job-applicants-page.component';
import { JobPostingPageComponent } from './pages/job-posting-page/job-posting-page.component';
import { authGuard, redirectIfAuthenticatedGuard } from './guards/auth.guard';
import { ApplicantDetailsPageComponent } from './pages/applicant-details-page/applicant-details-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthResolver } from './guards/auth.resolver';

export const routes: Routes = [
    { path: 'login', component: LoginPageComponent, canActivate: [redirectIfAuthenticatedGuard], resolve: { isLoggedIn: AuthResolver } },
    { path: 'register', component: RegisterPageComponent, canActivate: [redirectIfAuthenticatedGuard], resolve: { isLoggedIn: AuthResolver } },
    { path: 'dashboard', component: HomeDemoOneComponent, canActivate: [authGuard], resolve: { isLoggedIn: AuthResolver } },
    { path: 'job-listings', component: JobsListPageComponent, canActivate: [authGuard], resolve: { isLoggedIn: AuthResolver } },
    { path: 'job-applicants', component: JobApplicantsPageComponent, canActivate: [authGuard], resolve: { isLoggedIn: AuthResolver } },
    { path: 'job-applicant/:id', component: ApplicantDetailsPageComponent, canActivate: [authGuard], resolve: { isLoggedIn: AuthResolver } },
    {
        path: 'job',
        canActivate: [authGuard],
        resolve: { isLoggedIn: AuthResolver },
        children: [
            { path: '', redirectTo: 'add', pathMatch: 'full' },
            { path: 'add', component: JobPostingPageComponent },
            { path: 'edit/:id', component: JobPostingPageComponent },
        ],
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: ErrorPageComponent }
];
