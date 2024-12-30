import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {

  url = environment.SERVER_URL + '/icrweb/home/'
  constructor(private http: HttpClient) { }

  getMasters() {
    return this.http.get(this.url + 'get_company_signup_master', {
      headers: { header_type: '2', Portaltype: '2' },
    });
  }
  verifyShortCode(request:any) {
    return this.http.post(this.url + 'validate_company_shortcode', request);
  }
  saveRegistration(request:any) {
    return this.http.post(this.url + 'save_company_signup_tal_lite', request);
  }

  proceedToPay(request:any) {
    console.log(request);
    return this.http.post(this.url + 'create_session', request);
  }


  sendOTP(request:any) {
    return this.http.post(
      environment.SERVER_URL + 'icr/sendOtpWeb',
      request,
      {
        headers: {
          header_type: '1',
        },
      }
    );
  }

  verifyOTP(request:any) {
    return this.http.post(
      environment.SERVER_URL + 'icr/verifyOtpWeb',
      request,
      {
        headers: {
          header_type: '1',
        },
      }
    );
  }

  applyCoupon(request:any){
    console.log(request);
    return this.http.post(this.url + 'tallite_reg_apply_coupon', request);
  }
}
