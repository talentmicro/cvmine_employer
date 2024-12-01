import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ApiService {
    baseUrl = environment.apiUrl;

  	constructor(
        private http: HttpClient
  	) { }

    getJobListings(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}api_uat/icrweb/home/jobview_tal_lite`, body);
    }

    getDropdownsData(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}api_uat/icrweb/home/get_all_master_data_v1_tal_lite`, body);
    }

    getApplicants(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}api_uat/icrweb/home/ApplicantView_tal_lite`, body);
    }

    getJobDetails(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}api_uat/icrweb/home/JobDetailsWithMaster_v4_tal_lite`, body);
    }
}
