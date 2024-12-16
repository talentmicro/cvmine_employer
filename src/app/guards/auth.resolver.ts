import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from '../pages/services/auth/login.service';
import { TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Define the keys for TransferState
const AUTH_TOKEN_KEY = makeStateKey<string>('authToken');
const USER_DETAILS_KEY = makeStateKey<object>('userDetails');

@Injectable({
    providedIn: 'root',
})

export class AuthResolver implements Resolve<boolean> {
    constructor(
        private loginService: LoginService,
        private router: Router,
        private transferState: TransferState
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Promise<boolean>((resolve) => {
            if (isPlatformBrowser(this.router.routerState.root)) {
                // Check if the user is logged in using sessionStorage (browser-specific)
                const authToken = this.loginService.getAuthToken();
                
                if (authToken) {
                    resolve(true);
                } else {
                    this.router.navigate(['/login']);
                    resolve(false);
                }
            } else {
                // Server-side logic (during SSR) using TransferState
                const authToken = this.transferState.get(AUTH_TOKEN_KEY, null);

                if (authToken) {
                    resolve(true);  // Already authenticated
                } else {
                    resolve(false); // Not authenticated
                }
            }
        });
    }
}
