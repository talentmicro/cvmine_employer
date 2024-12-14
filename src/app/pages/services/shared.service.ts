import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})

export class SharedService {
    private masterDropdowns = new BehaviorSubject<any>(null); // BehaviorSubject to store dropdown data
    public masterDropdowns$ = this.masterDropdowns.asObservable(); // Observable for components to subscribe to

    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) {}

    fetchAndSetDropdownData(body: any): void {
        this.apiService.getDropdownsData(body).subscribe((data) => {
            this.masterDropdowns.next(data);
        });
    }

    getMasterDropdowns() {
        return this.masterDropdowns.getValue();
    }
}
