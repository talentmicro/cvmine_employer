import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
    severity: string;
    summary: string;
    detail: string;
}

@Injectable({
    providedIn: 'root',
})

export class ToastService {
    private toastSubject = new Subject<ToastMessage>();
    toastMessages$ = this.toastSubject.asObservable();

    showToast(message: ToastMessage) {
        console.log('show toast sub changed', message);
        this.toastSubject.next(message);
    }

    // ngOnDestroy(): void {
    //     this.toastSubject.complete();
    // }
}
