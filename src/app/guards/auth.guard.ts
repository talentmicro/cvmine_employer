import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../pages/services/auth/login.service';
import { LoadingService } from '../common/loading-spinner/loading.service';

export const authGuard: CanActivateFn = (route, state) => {
    const loginService = inject(LoginService);
    const loadingService = inject(LoadingService);
    const router = inject(Router);
    loadingService.show();

    if (loginService.isLoggedIn()) {
        loadingService.hide();
        return true;
    }

    loadingService.hide();
    router.navigate(['/login']);
    return false;
};

export const redirectIfAuthenticatedGuard: CanActivateFn = (route, state) => {
    const loginService = inject(LoginService);
    const loadingService = inject(LoadingService);
    const router = inject(Router);
    loadingService.show();

    if (loginService.isLoggedIn()) {
        loadingService.hide();
        router.navigate(['/job-listings']);
        return false;
    }

    loadingService.hide();
    return true;
};