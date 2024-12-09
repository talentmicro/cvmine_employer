import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { loginSuccess, loginFailure, logout } from '../../../store/actions/auth.actions';
import { AppState } from '../../../store/app.state';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class LoginService {
    private loginSubject = new BehaviorSubject<boolean>(
        this.isBrowser() && !!sessionStorage.getItem('authToken')
    );
    loginState$ = this.loginSubject.asObservable();

    private apiUrl = `${environment.apiUrl}api_uat/icrweb/home/weblogin_tal_lite`;

    constructor(
        private http: HttpClient, 
        private store: Store<AppState>
    ) {}

    login(employeeId: string, password: string): Observable<any> {
        return this.http.post<any>(this.apiUrl, { employeeId, password }).pipe(
            map((response) => {
                if (this.isBrowser()) {
                    sessionStorage.setItem('authToken', response.data.userDetails.token);
                    sessionStorage.setItem('userDetails', JSON.stringify(response.data.userDetails));
                }
                this.store.dispatch(loginSuccess({ 
                    token: response.data.userDetails.token, 
                    user: response.data.userDetails 
                }));
                this.loginSubject.next(true);
                return response;
            }),
            catchError((error) => {
                this.store.dispatch(loginFailure({ error }));
                this.loginSubject.next(false);
                throw error;
            })
        );
        // return this.http.post<any>(this.apiUrl, { employeeId, password }).pipe(
        //     map((response) => {
        //         sessionStorage.setItem('authToken', response.data.userDetails.token);
        //         sessionStorage.setItem('userDetails', JSON.stringify(response.data.userDetails));
        //         this.store.dispatch(loginSuccess({ 
        //             token: response.data.userDetails.token, 
        //             user: response.data.userDetails 
        //         }));
    
        //         this.loginSubject.next(true);
    
        //         if (this.isBrowser()) {
        //             window.location.reload();
        //         }
    
        //         return response;
        //     }),
        //     catchError((error) => {
        //         this.loginSubject.next(false);
        //         throw error;
        //     })
        // );
    }

    logout(): void {
        if (this.isBrowser()) {
            sessionStorage.clear();
        }
        this.store.dispatch(logout());
        this.loginSubject.next(false);
    }

    isLoggedIn(): boolean {
        return this.isBrowser() && !!sessionStorage.getItem('authToken');
    }

    getAuthToken(): any {
        return this.isBrowser() && sessionStorage?.getItem('authToken');
    }
    
    getUserDetails(): any {
        return this.isBrowser() && JSON.parse(sessionStorage?.getItem('userDetails') || '{}');
    }

    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
    }
}

