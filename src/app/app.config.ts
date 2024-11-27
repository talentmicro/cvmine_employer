import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpRequestInterceptor } from './interceptors/http-interceptor';
import { provideStore } from '@ngrx/store';
import { authReducer } from './store/reducers/auth.reducer';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }), 
        provideRouter(routes), 
        provideClientHydration(), 
        provideAnimationsAsync(),
        provideHttpClient(
            withInterceptors([httpRequestInterceptor])
        ),
        provideStore({
            auth: authReducer
        })
    ]
};