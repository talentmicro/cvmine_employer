import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { loginSuccess, loginFailure, logout } from '../../../store/actions/auth.actions';
import { AppState } from '../../../store/app.state';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../shared.service';
import { TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// TransferState key to cache auth token
const AUTH_TOKEN_KEY = makeStateKey<string | null>('authToken');
const USER_DETAILS_KEY = makeStateKey<object | null>('userDetails');

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    private loginSubject = new BehaviorSubject<boolean>(this.initializeLoginState());
    loginState$ = this.loginSubject.asObservable();
    private apiUrl = `${environment.apiUrl}icrweb/home/weblogin_tal_lite`;

    constructor(
        private http: HttpClient,
        private store: Store<AppState>,
        private sharedService: SharedService,
        private ngZone: NgZone,
        private transferState: TransferState,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    private initializeLoginState(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            // In the browser, check sessionStorage
            return !!sessionStorage.getItem('authToken');
        } else {
            // On the server, retrieve the state from TransferState
            return !!this.transferState.get(AUTH_TOKEN_KEY, null);
        }
    }

    login(employeeId: string, password: string): Observable<any> {
        return this.http.post<any>(this.apiUrl, { employeeId, password }).pipe(
            map((response) => {
                const token = response.data.userDetails.token;
                const userDetails = response.data.userDetails;

                if (isPlatformBrowser(this.platformId)) {
                    // Store data in sessionStorage for the browser
                    sessionStorage.setItem('authToken', token);
                    sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
                } else {
                    // Store data in TransferState for the server
                    this.transferState.set(AUTH_TOKEN_KEY, token);
                    this.transferState.set(USER_DETAILS_KEY, userDetails);
                }

                // Dispatch the login success action
                this.store.dispatch(loginSuccess({ token, user: userDetails }));

                // Update the login state
                this.ngZone.run(() => {
                    this.loginSubject.next(true);
                });

                // this.sharedService.fetchAndSetDropdownData({});
                return response;
            }),
            catchError((error) => {
                this.store.dispatch(loginFailure({ error }));
                this.ngZone.run(() => {
                    this.loginSubject.next(false);
                });
                throw error;
            })
        );
    }

    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            // Clear sessionStorage in the browser
            sessionStorage.clear();
        } else {
            // Clear TransferState on the server
            this.transferState.set(AUTH_TOKEN_KEY, null);
            this.transferState.set(USER_DETAILS_KEY, null);
        }

        // Dispatch the logout action
        this.store.dispatch(logout());

        // Update the login state
        this.ngZone.run(() => {
            this.loginSubject.next(false);
        });
    }

    isLoggedIn(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            // Check sessionStorage in the browser
            return !!sessionStorage.getItem('authToken');
        } else {
            // Check TransferState on the server
            return !!this.transferState.get(AUTH_TOKEN_KEY, null);
        }
    }

    getAuthToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return sessionStorage.getItem('authToken');
        } else {
            return this.transferState.get(AUTH_TOKEN_KEY, null);
        }
    }

    getUserDetails(): any {
        if (isPlatformBrowser(this.platformId)) {
            const userDetails = sessionStorage.getItem('userDetails');
            return userDetails ? JSON.parse(userDetails) : null;
        } else {
            return this.transferState.get(USER_DETAILS_KEY, null);
        }
    }
}
