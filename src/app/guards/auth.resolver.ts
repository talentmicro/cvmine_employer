import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../pages/services/auth/login.service';

@Injectable({
    providedIn: 'root',
})

export class AuthResolver implements Resolve<boolean> {
    constructor(
        private loginService: LoginService, 
        private router: Router
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Promise<boolean>((resolve) => {
            if (this.loginService.isLoggedIn()) {
                resolve(true);
            } else {
                this.router.navigate(['/login']);
                resolve(false);
            }
        });
    }
}
