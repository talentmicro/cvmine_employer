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
        return this.http.post(`${this.baseUrl}icrweb/home/jobview_tal_lite`, body);
    }

    getJobs(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/get_searchpage_joblist_tal_lite`, body);
    }

    getDropdownsData(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/get_all_master_data_v1_tal_lite`, body);
    }

    getApplicants(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/ApplicantView_tal_lite`, body);
    }

    getJobDetails(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/JobDetailsWithMaster_v4_tal_lite`, body);
    }

    changeJobStatus(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/save_job_status`, body);
    }

    getApplicationDetails(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/resumeDetailWithMasterData_v4_tal_lite`, body);
    }

    changeApplicantionStatus(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/submit_stage_status_quick_update_tal_lite`, body);
    }

    getCityList(body: any): Observable<any> {
        return this.http.post(`${this.baseUrl}icrweb/home/get_city_list_tal_lite`, body);
    }
}
