import { Component, ElementRef, HostListener, Inject, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, ViewChild, } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { FileUploadEvent, FileUploadModule, UploadEvent } from 'primeng/fileupload';
import {
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormBuilder,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputOtpModule } from 'primeng/inputotp';
import { RadioButtonModule } from 'primeng/radiobutton';
import { jsonParse, jsonDeepParse, getIP } from '../../functions/shared-functions';
import { CheckboxModule } from 'primeng/checkbox';
import { RegistrationService } from '../services/registration/registration.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { TermsComponent } from "../terms/terms.component";
import { GoogleMapComponent } from "../google-map/google-map.component";

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    StepsModule,
    CardModule,
    FileUploadModule,
    PasswordModule,
    DropdownModule,
    InputGroupAddonModule,
    InputGroupModule,
    StepperModule,
    DialogModule,
    ButtonModule,
    CommonModule,
    TableModule,
    InputTextModule,
    InputOtpModule,
    RadioButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    RouterModule,
    CommonModule,
    RouterModule,
    ToastModule,
    TermsComponent,
    GoogleMapComponent
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  providers: [MessageService]
})
export class RegistrationComponent {

  // stepItems = [
  //   { label: 'Select a Product', command: (event: any) => this.messageService.add({ severity: 'info', summary: 'First Step', detail: event.item.label }) },
  //   { label: 'Registration details' },
  //   { label: 'Contact' },
  //   { label: 'Address' },
  //   { label: 'Password' },
  //   { label: 'KYC FEE' },
  //   { label: 'Payment' },
  // ];


  // stepItems1 = [
  //   { label: 'Select a Product' },
  //   { label: 'Registration details' },
  //   { label: 'Contact' },
  //   { label: 'Address' },
  //   { label: 'Password' },
  // ];

  stepItem2 = [
    { label: 'Registration details' },
    { label: 'Contact' },
    { label: 'Address' },
    { label: 'Password' },
    { label: 'KYC FEE' },
  ]


  couponCardList: any;
  query_param_flag: boolean = false;
  passwordVisible = false;
  Re_passwordVisible = false;
  verification_message: string = '';
  verification_status = false;
  masters: any = {};
  form_control: any[] = [];
  masters_loading: boolean = false;
  param_index!: number;
  submit_flag = false;
  email_verification = {
    emailId: null,
    verification: false,
  };
  viewOtpfield = false;
  otp: any = null;
  loading = false;
  setOfCheckedId = new Set<number>();
  current = 0;
  stepsLength!: number;
  current_product: any = null;
  index = 'First-content';
  employer_form!: FormGroup;
  pinterval: any;
  show_map = 1;
  interval!: number;
  loader_flag = false;
  hide_flag = false;
  mob_max_length = 10;
  mismatch: any;
  msg: string = '';
  isVisible = false;
  selectedProductId: any;
  showModal(): void {
    this.isVisible = true;
  }
  handleCancel(): void {
    this.isVisible = false;
  }
  handleOk(): void {
    this.employer_form.get('terms')?.patchValue(true);
    this.isVisible = false;
  }
  beforeUpload = (file: any, fileList: any[]): boolean | Observable<boolean> => {
    let maxFiles = 4;
    if (this.fileList.length >= maxFiles) {
      this.msg = `You can only upload up to ${maxFiles} files.`;
      return false;
    }
    else {
      this.readFile(file);
    }

    return false; // Prevent the default upload behavior
  };
  fileList: any = [];
  step_valid = 4;
  files = [];
  documentUploaded: boolean = true;
  current_ip: any = getIP(this.platform_id) || {};
  valid_captcha: boolean = false;
  captcha_loading_interval: any;
  valid_captcha_flag = false;
  route_subscriber!: Subscription;
  @ViewChild('recaptcha', { static: true }) captch_element!: ElementRef;
  submitted = false;
  queryParams: any;
  loader_msg: string = '';
  isMobile: boolean = false;
  shared_link!: number;
  storedFiles: any = [];
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (isPlatformBrowser(this.platform_id)) {
      this.isMobile = window.innerWidth < 768; // Adjust threshold if needed
    }

  }
  constructor(
    private formBuilder: FormBuilder,
    private registration: RegistrationService,
    private activated_route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platform_id: any,
  ) {

    if (isPlatformBrowser(platform_id)) {
      this.isMobile = window.innerWidth < 768;
    }
  }
  readFile(file: any): void {
    console.log(file);
    const reader = new FileReader();

    reader.onload = (e: any) => {
      // Store the file and its local URL
      console.log(e.target)
      if (this.fileList.length) {
        this.fileList = [...this.fileList, { ...file, name: file.name, status: 'done', url: e.target.result, fileName: file.name, fileSize: e.size, type: e.type }];
      }
      else {
        this.fileList = [{ ...file, status: 'done', name: file.name, url: e.target.result, fileName: file.name, fileSize: file.size, type: e.type }];
      }
      this.storedFiles.push({
        name: file.name,
        FileName: file.name,
        // FileSize: this.mediaService.getFileSize(file.size) + ' ' + this.mediaService.getFileSizeUnit(file.size),
        FileType: file.type,
        FileUrl: e.target.result,
      });


    };

    reader.readAsDataURL(file as any); // Cast to `any` to read the file as a data URL

  }

  // async uploadAttachments(): Promise<boolean> {
  //   return new Promise(async (resolve, reject) => {
  //     console.log(this.fileList);
  //     console.log(this.storedFiles);

  //     if (this.fileList.length) {
  //       for (const item of this.fileList) {
  //         try {
  //           console.log(item);

  //           let fileList_final = {
  //             FileName: item.fileName,
  //             // FileSize: this.mediaService.getFileSize(item.FileSize) + ' ' + this.mediaService.getFileSizeUnit(item.FileSize),
  //             FileType: item.FileType,
  //             content: item.url,
  //           };
  //           console.log(fileList_final);

  //           // let f = this.mediaService.makeFormDataFile(fileList_final);
  //           let form_data = new FormData();
  //           // console.log(f);
  //           // form_data.append('attachment', f, item.fileName);
  //           console.log(form_data);

  //           // const res:any = await this.mediaService.uploadAttachment(form_data).toPromise();

  //           if (res && res['status']) {
  //             console.log(res);
  //             this.form_control.push(res['data']);
  //             console.log(this.form_control);
  //           } else {
  //             // Handle the case where the upload fails but continue processing the remaining files
  //             this.router.navigate(['/reg-failed'], { queryParams: { message: res['message'] } });
  //             this.loader_flag = false;
  //             console.log('Failed to upload');
  //             // (await this.router.navigate(['/paye'])).valueOf
  //           }
  //         } catch (error) {
  //           console.error('Error uploading file', item.fileName, error);
  //           // Optionally, you could reject here if you want to stop processing on error
  //           // reject(error);
  //         }
  //       }
  //       resolve(true);
  //     } else {
  //       resolve(false);
  //     }
  //   });
  // }


  ngOnChanges(changes: SimpleChanges): void {

  }

  inputChange() {
    this.employer_form.get('shortCode')?.valueChanges.subscribe(res => {
      console.log(res)
      console.log(res.length)
      if (res.length <= 4) {
        this.verification_message = '';
        this.verification_status = false;
      }
    }
    )
  }

  ngOnInit(): void {

    console.log(this.current_ip);

    if (isPlatformBrowser(this.platform_id)) {
      // Safe to use navigator here
      navigator.permissions.query({ name: 'geolocation' })
        .then((res) => {
          if (res['state'] === 'granted') {
            // Permission granted
          } else {
            navigator.geolocation.getCurrentPosition((res) => {
              console.log(res.coords)
              this.employer_form.get('latitude')?.patchValue(res.coords.latitude);
              this.employer_form.get('longitude')?.patchValue(res.coords.longitude);
              console.log(this.employer_form)
            });
          }
        });

      this.createForm();
      this.getMasters();
      this.queryParams = this.activated_route.snapshot.queryParams;

    }

    if (this.isBrowser()) {
      let ip: any = localStorage.getItem('getipobject');
    }

    if (this.employer_form?.controls?.['annualSubscription']?.value > 0) {
      this.stepsLength = 7;
    } else {
      this.stepsLength = 5;
    }



  }

  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }



  createForm() {
    const urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    this.employer_form = this.formBuilder.group(
      {
        companyType: [null],
        sellerCompanyName: [
          null,
          [Validators.required, Validators.maxLength(100)],
        ],
        websiteUrl: [[], Validators.pattern(urlRegex)],
        registrationDocuments: [[], Validators.required],
        shortCode: ['', [Validators.required, Validators.maxLength(5)]],
        firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z ]*')]],
        lastName: ['', [Validators.maxLength(50), Validators.pattern('[a-zA-Z ]*')]],
        emailId: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-z]{2,4}|[0-9]{1,3})(\]?)$/
            ),
            Validators.maxLength(50),
          ],
        ],
        mobileIsd: ['+91', Validators.required],
        mobileNumber: [
          null,
          [Validators.required, mobileNumberLengthValidator(10)],
        ],
        addressLine1: [null, [Validators.maxLength(100)]],
        addressLine2: [null, [Validators.required, Validators.maxLength(100)]],

        latitude: [null],
        longitude: [null],
        city: [null, [Validators.required, Validators.maxLength(100)]],
        state: [null, [Validators.required, Validators.maxLength(100)]],
        country: [null, [Validators.required, Validators.maxLength(100)]],
        postalCode: [
          null,
          [
            Validators.required,
            Validators.maxLength(6),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/(?=.*\W)(?=.*\d)/),
          ],
        ],
        confirmpassword: ['', [Validators.required]],
        parentCompanyCode: [null],
        productTypeId: [null, Validators.required],
        skillsForTraining: [null],
        expFrom: [null],
        expTo: [null],
        preferredLocationIds: [null],
        preferredLocation: [null],
        annualSubscriptionCurrency: [0],
        annualSubscription: [0],
        paymentOptions: [null],
        prepaidCode: [null, Validators.required],
        terms: [null, Validators.required],
        isEmailVerified: [null, Validators.required],
      },

    );
  }

  showApply = false;

  isCoupon() {
    this.showApply = !this.showApply
  }
  applyCoupon() {
    console.log(this.employer_form.value.prepaidCode);

    if (this.employer_form.value.prepaidCode != null && this.employer_form.value.prepaidCode != '') {
      const obj = {
        prepaidCode: this.employer_form.value.prepaidCode.toUpperCase(),
      }

      console.log(obj);
      this.registration.applyCoupon(obj).subscribe((res: any) => {
        if (res && res['data']) {
          console.log(res['data'].list);
          this.couponCardList = jsonDeepParse(res['data'].list);
        } else {
          const obj = this.masters.talliteBusinessProductList.find((ele: any) => ele.shortCode === "TM199");
          this.couponCardList = jsonDeepParse(obj.childProductList);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res['message'] });
        }

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })

      });
    }
    else {
      const obj = this.masters.talliteBusinessProductList.find((ele: any) => ele.shortCode === "TM199");
      this.couponCardList = jsonDeepParse(obj.childProductList);
    }

  }

  talliteProductId: any=null;

  onSubscribeChange(id: any) {
    if (this.talliteProductId === id) {
      this.talliteProductId = null;
    } else {
      this.talliteProductId = id;
      console.log(this.talliteProductId);
    }
  }

  checkPassword(): any {
    let newPass = this.employer_form.get('password')?.value;
    let confirmPass = this.employer_form.get('confirmpassword')?.value;
    return newPass == confirmPass ? '' : 'error';
  }
  setIndex(flag: boolean) {

  }
  value_id = null;
  productTypeChanged(ev: any, item: { id: number; shortCode: any; param_index: number; amount: number; currency: any; childProductList: any }) {
    this.param_index = item.id;
    console.log(this.param_index);
    console.log(item);
    this.couponCardList = jsonDeepParse(item.childProductList);
    console.log(this.couponCardList);
    this.setOfCheckedId.clear();
    this.setOfCheckedId.add(item.id);

    this.employer_form.get('productTypeId')?.setValue(item?.shortCode);
    if (!this.query_param_flag) {
      if (this.param_index !== 4 || item?.param_index !== 5) {
        this.step_valid = 5;
      }
    }

    this.current_product = item;

    this.employer_form.controls['annualSubscription'].patchValue(item?.amount);
    this.employer_form.controls['annualSubscriptionCurrency'].patchValue(
      item.currency
    );
    if (item.amount > 0) {
      this.employer_form.controls['paymentOptions'].setValidators([
        Validators.required,
      ]);
      this.employer_form.controls['paymentOptions'].updateValueAndValidity();
    } else {
      this.employer_form.controls['paymentOptions'].clearValidators();
      this.employer_form.controls['paymentOptions'].updateValueAndValidity();
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

  }

  getStatus(): any {
    const control = this.employer_form.get('password');
    if (control?.invalid && (control.dirty || control.touched)) {
      return 'error' as any;
    } else if (control?.valid) {
      return 'success' as any;
    } else {
      return '';
    }
  }

  pre(): void {

    this.current -= 1;
    console.log(this.current)
  }


  next(val: number, step?: number): void {

    if (step) {
      this.step_valid = step;
    }
    console.log(this.employer_form.get('productTypeId')?.value);
    this.current += val;
    console.log(this.current)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  done(): void {
    console.log('done');
  }

  handleChange(event: any) {

    console.log(event)
    console.log(this.fileList)
    if (event) {
      this.msg = '';
    }

  }

  onOtpChange(event: any) {
    console.log(event);
    console.log(event.value.length);
    if (event.value.length == this.otpLength) {
      this.optInputLength = event.value.length;
      this.otp = event.value;
      console.log(this.otp);
      this.verifyOtp();
    }

  }

  successTip!: string;
  errorTip!: string;
  nzStatusAvailability(): any {

    if (!this.verification_status) {

      this.errorTip = this.verification_message
      return 'error' as any;
    }
    else {
      this.errorTip = this.verification_message
      return 'success' as any;
    }
  }
  short_codeFlag = false;

  final_submission = true

  verifyShortCode() {
    this.short_codeFlag = true;
    this.submit_flag = true;


    if (this.employer_form.controls['shortCode'].valid) {
      this.registration
        .verifyShortCode({
          shortCode: this.employer_form.value.shortCode,
        })
        .subscribe((res: any) => {
          if (res && res['status'] && res['data']) {
            if (res['data'].valid) {
              this.verification_status = true;
              this.nzStatusAvailability()
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res['data']['displayMsg'] });

              this.verification_message = res['data']['displayMsg'];
            } else {
              this.verification_status = false;
              this.nzStatusAvailability()

              this.messageService.add({ severity: 'error', summary: 'Error', detail: res['data']['displayMsg'] });

              this.verification_message = res['data']['displayMsg'];
            }
          } else {
            this.verification_message = res['message'];
            this.verification_status = false;
            this.nzStatusAvailability()
          }
        });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter Short code to proceed' });
    }
  }

  verifyEmailID() {
    if (this.employer_form.controls['emailId'].valid) {
      let req = {
        emailId: this.employer_form.value.emailId,
        isRegistration: 1,
      };
      console.log(req);
      this.registration.sendOTP(req).subscribe((res: { [x: string]: any; }) => {
        console.log(res)
        if (res && res['status']) {
          console.log(res)
          this.otpLength = res['data'].otpLength;
          this.viewOtpfield = true;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });

        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res['message'] });
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please Enter a valid Email ID to proceed' });
    }
  }

  otpLength: number = 6;
  optInputLength!: number;

  VerifyOTP(event: any) {
    console.log(this.otpLength);
    console.log(this.optInputLength);
    if (this.optInputLength == this.otpLength) {
      this.verifyOtp();
    }

  }

  verifyOtp() {
    if (this.employer_form.controls['emailId'].valid) {
      let req = {
        emailId: this.employer_form.value.emailId,
        isRegistration: 1,
        otp: this.otp,
      };
      console.log(req);

      this.registration.verifyOTP(req).subscribe((res: { [x: string]: any; }) => {
        if (res && res['status']) {
          this.email_verification.verification = true;

          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });

          this.viewOtpfield = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res['message'] });
        }
      });
    } else {

      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please Enter a valid OTP' });

    }
  }

  getMasters() {
    this.masters_loading = true;
    this.registration.getMasters().subscribe(
      (res: { [x: string]: any; }) => {
        if (res && res['status'] && res['data']) {
          this.masters = res['data'];
          console.log(this.masters.talliteBusinessProductList);
          if (
            this.masters &&
            this.masters.companyTypeList &&
            this.masters.companyTypeList.length
          ) {
            if (this.queryParams && this.queryParams.companyType) {
              let index = this.masters.companyTypeList.findIndex(
                (d: { code: any; }) => d.code == this.queryParams.companyType
              );
              if (index > -1) {
                this.employer_form.controls['companyType'].patchValue([
                  this.masters.companyTypeList[index].code,
                ]);
                this.employer_form.controls['parentCompanyCode'].patchValue(
                  this.queryParams.parentCompanyCode
                );
              } else {
                this.employer_form.controls['companyType'].patchValue([
                  this.masters.companyTypeList[0].code,
                ]);
              }
            } else {
              this.employer_form.controls['companyType'].patchValue([
                this.masters.companyTypeList[0].code,
              ]);
            }
          }

          if (this.queryParams?.pid) {
            console.log(this.queryParams?.pid)
            if (this.masters?.talliteBusinessProductList?.length) {
              let index = this.masters.talliteBusinessProductList.findIndex((d: { shortCode: string; }) => d.shortCode.toLowerCase() == this.queryParams.pid.toLowerCase())
              if (index > -1) {
                this.shared_link = 1;
                this.param_index = this.masters.talliteBusinessProductList[index].id;
                console.log(this.masters.talliteBusinessProductList[index].id)
                this.employer_form.controls['productTypeId'].patchValue(this.masters.talliteBusinessProductList[index].id);
                this.productTypeChanged(null, this.masters.talliteBusinessProductList[index]);
                this.query_param_flag = true;
                if (this.query_param_flag && (this.param_index == 4 || this.param_index == 5)) {
                  let flag = true;
                  this.step_valid = 4;
                  this.setIndex(flag)
                }
                else {
                  this.step_valid = 3;
                }

                this.hide_flag = true;
              }
            }
            try {
            }
            catch (err) {
              console.log(err)
            }
          }

          const obj = this.masters.talliteBusinessProductList.find((ele: any) => ele.shortCode === "TM199");
          console.log(obj);

          this.productTypeChanged(null, obj);

          this.masters_loading = false;

        }
      },
      (err: any) => {
        this.masters_loading = false;
      }
    );
  }
  verifyCaptch(ev: any) {
    this.valid_captcha = true;
    this.valid_captcha_flag = this.valid_captcha_flag = ev ? true : false;;
  }
  setMaxLenghtToMobileNumber(ev: any) {
    console.log(ev);
    if (ev) {
      const data = this.masters.countryList;

      console.log(data);

      const num = data.find((item: { dial_code: any; }) => item?.dial_code == ev.value);

      this.mob_max_length = num.mobileNumberLength;

      this.employer_form?.get('mobileNumber')?.setValidators(mobileNumberLengthValidator(this.mob_max_length));
      this.employer_form.get('mobileNumber')?.updateValueAndValidity();
    }
  }
  phone_max_length: any;
  setMaxLenghtToPhoneNumber(ev: { mobileNumberLength: any; }) {
    this.phone_max_length = ev.mobileNumberLength;
  }

  paymentOptionChanged(ev: any) {
    console.log(ev);
    if (ev == 2) {
      this.employer_form.controls['prepaidCode'].setValidators([
        Validators.required,
      ]);
      this.employer_form.controls['prepaidCode'].updateValueAndValidity();
    } else {
      this.employer_form.controls['prepaidCode'].clearAsyncValidators();
      this.employer_form.controls['prepaidCode'].updateValueAndValidity();
    }
  }

  async executeSubmission(): Promise<void> {
    this.loader_flag = true;
    this.loader_msg = 'please  wait while attachments are being uploaded !!'
    try {
      // const flag = await this.uploadAttachments();
      // if (flag) {

      //   if (this.documentUploaded) {
      //     this.loader_msg = 'please  wait while form is being submitted !!'
      //     console.log(this.form_control);
      //     if (this.form_control) {
      //       this.employer_form.get('registrationDocuments')?.setValue(this.form_control)
      //       this.onSubmit();
      //     }
      //   }


      //   this.loader_flag = false;
      // }
      this.onSubmit();

    } catch (error) {
      console.error('Error in first function', error);
      this.loader_flag = false;
    }
  }

  onSubmit() {
    this.loader_flag = true;
    this.submitted = true;

    if (this.employer_form.value.terms) {
      this.loading = true;
      let obj = this.employer_form.value;
      obj['ip'] = this.current_ip.ip;

      if (this.queryParams) {
        Object.keys(this.queryParams).forEach((k) => {
          obj[k] = this.queryParams[k];
        });
      }

      // Navigate to loader screen
      // this.router.navigate(['/loader']);

      console.log(obj);

      this.registration.saveRegistration(obj).subscribe(
        (res: { [x: string]: any; }) => {
          console.log(res)
          if (res['status'] === true) {
            if (Number(this.current_product?.amount) > 0) {
              this.proceedPay(res['data']);
            } else {
              let route_data = {
                data: res['data'],
                message: res['message']
              }
              const serializedObj = JSON.stringify(route_data);
              this.router.navigate(['/reg-success'], { queryParams: { data: serializedObj } });
              this.loader_flag = false;
            }
          } else {

            this.router.navigate(['/reg-failed'], { queryParams: { message: res['message'] } });
            this.loader_flag = false;
          }
        },
        (err: any) => {
          this.loader_flag = false;

          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please Enter a valid OTP' });
          // Optionally navigate to a failure page or show an error message
        }
      );
    } else {
      this.loader_flag = false;
      if (!this.verification_status) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please verify Short code to continue' });
      } else if (!this.employer_form.value.terms) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please Agree to Terms and Conditions' });
      } else if (!this.valid_captcha_flag) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please verify Captcha to continue' });
      }
    }
  }




  scrollTo(el: Element): void {
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  scrollToError(): void {
    try {
      const firstElementWithError: any = document.querySelector(
        '.ng-invalid[formControlName]'
      );
      this.scrollTo(firstElementWithError);
    } catch (err) {
      console.log(err);
    }
  }
  proceedPay(data?: { regLicenseKey: any; }) {
    console.log(data)
    this.loader_msg = 'Redirecting'
    console.log('proceeed payment');
    console.log({
      inputAmount: this.employer_form.value.annualSubscription,
      currency: this.employer_form.value.annualSubscriptionCurrency,
      regLicenseKey: data?.regLicenseKey,
      talliteProductId: this.talliteProductId,
      emailId: this.employer_form.value.emailId,
    })
    this.registration
      .proceedToPay({
        inputAmount: this.employer_form.value.annualSubscription,
        currency: this.employer_form.value.annualSubscriptionCurrency,
        regLicenseKey: data?.regLicenseKey,
        talliteProductId: this.talliteProductId,
        emailId: this.employer_form.value.emailId,
      })
      .subscribe((res: { [x: string]: any; }) => {
        console.log(res);
        if (res['status']) {
          console.log(res)
          if (isPlatformBrowser(this.platform_id)) {
            localStorage.setItem('paymentUrl', res['data'].paymentUrl);
            window.location.href = res['data'].paymentUrl;
            this.loader_flag = false;
          }
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res['message'] });
          this.loader_flag = false;
        }
      });
  }

  //   openLocation(){
  //     this.modalService.create({
  //       nzTitle: 'Google Maps Popup',
  //       nzContent: GoogleMapsPopupComponent,
  //       nzFooter: null,
  //       nzData : {
  //         modalData: {
  //           latitude: 40.730610, // example latitude
  //           longitude: -73.935242 // example longitude
  //         }
  //       },
  //       nzOnOk: () => console.log('OK'),
  //       nzOnCancel: () => console.log('Cancel')
  //     });
  // }
  isOpenMap = false;
  openMap() {
    this.isOpenMap = true;
  }
  closeMap() {
    this.isOpenMap = false;
  }
  submitMap() {
    this.employer_form.patchValue({
      addressLine1: this.address1,
      addressLine2: this.address2,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.pincode
    });
    this.isOpenMap = false;
  }

  updateLatLng(lat: number, lng: number) {
    this.latLngSubject.next({ lat, lng });
  }

  markerCoordinatesArray = [
    { title: "Banglore office", lat: 12.931371436925785, lng: 77.57402391911849 },
    { title: "Banglore Cafe", lat: 12.931724351651878, lng: 77.57330776931151 },
    { title: "", lat: 12.932236730662092, lng: 77.57231803418502 }
  ];

  latLngSubject = new Subject<{ lat: number, lng: number }>();

  address: string = '';
  address1: string = '';
  address2: string = '';
  pincode: string = '';
  city: string = '';
  state: string = '';
  country: string = '';

  onAddressChange(addressData: any) {
    this.address = addressData.address;
    this.address1 = addressData.address1;
    this.address2 = addressData.address2;
    this.pincode = addressData.pincode;
    this.city = addressData.city;
    this.state = addressData.state;
    this.country = addressData.country;
  }



  // Handles file removal
  removeFile(file: any) {
    this.fileList = this.fileList.filter((f: any) => f !== file);
  }

  // Handles the upload process
  onUpload(event: any) {
    console.log(event);
    // Logic to upload files to a server
    console.log('Files uploaded:', this.fileList);
    this.fileList = []; // Clear the file list after upload
  }

  cardSelect: boolean = false;
  card_id!: number;

  plan_selected(type: number) {
    if (type === 1) {
      this.card_id = type;
      if (!this.cardSelect) {
        this.cardSelect = true;
      }
    } else if (type === 2) {
      this.card_id = type;
      if (!this.cardSelect) {
        this.cardSelect = true;
      }
    } else {
      this.card_id = type;
      if (!this.cardSelect) {
        this.cardSelect = true;
      }
    }
  }



}
function mobileNumberLengthValidator(length: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    if (
      (value && value.toString().length < length) ||
      (value && value.toString().length > length)
    ) {
      return {
        maxLength: {
          requiredLength: length,
          actualLength: value.toString().length,
        },
      };
    }
    return null;
  };


}
