import { Component, ElementRef, HostListener, Inject, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, ViewChild, } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { MessageService, PrimeNGConfig } from 'primeng/api';
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
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { FilesService } from '../services/files/files.service';

declare var google: any;

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
    GoogleMapComponent,
    BadgeModule,
    ProgressBarModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  providers: [MessageService, FilesService]
})
export class RegistrationComponent {

  @ViewChild('cityInput') cityInput: ElementRef | undefined;
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


  onStepChange(event:any) {
    console.log('Step changed:', event);
  }

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
    this.employer_form.get('terms')?.patchValue(1);
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
    private config: PrimeNGConfig,
    private file_src: FilesService
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

  ngOnChanges(changes: SimpleChanges): void {

  }

  inputChange() {
    this.employer_form.get('shortCode')?.valueChanges.subscribe(res => {
      console.log(res)
      console.log(res.length)
      if (res?.length > 5) {
        this.verification_message = '';
        this.verification_status = false;
      }else{
        this.verification_status = true;
      }
    }
    )
  }

  ngOnInit(): void {

    console.log(this.current_ip);

    if (isPlatformBrowser(this.platform_id)) {
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


  initializeAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.cityInput?.nativeElement, {

    });
    types: ['address']

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (place.geometry) {
        console.log(place);
        const addressLine1 = this.getAddressLine1FromPlace(place);
        const addressLine2 = this.getAddressLine2FromPlace(place);
        const city = this.getCityFromPlace(place);
        const state = this.getStateFromPlace(place);
        const country = this.getCountryFromPlace(place);
        const pincode = this.getPincodeFromPlace(place);

        // this.employer_form.controls['addressLine1'].patchValue(addressLine1);
        this.employer_form.controls['addressLine2'].patchValue(addressLine2);
        this.employer_form.controls['city'].patchValue(city);
        this.employer_form.controls['state'].patchValue(state);
        this.employer_form.controls['country'].patchValue(country);
        this.employer_form.controls['postalCode'].patchValue(pincode);

      }
    });
  }

  getAddressLine1FromPlace(place:any) {
    // Typically, the first component can be the 'premise' or street address
    const premise = place.address_components.find((component:any) => component.types.includes('premise'));
    return premise ? premise.long_name : '';
  }

  getAddressLine2FromPlace(place:any) {
    // This might be the sublocality or locality component
    const sublocality = place.address_components.find((component:any) => component.types.includes('sublocality'));
    const locality = place.address_components.find((component:any) => component.types.includes('locality'));

    // Concatenate sublocality and locality for a detailed address line 2
    return (sublocality ? sublocality.long_name : '') + (locality ? ', ' + locality.long_name : '');
  }

  getCityFromPlace(place: any) {
    let city = '';
    place.address_components.forEach((component: any) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
    });
    return city;
  }

  getStateFromPlace(place: any) {
    let state = '';
    place.address_components.forEach((component: any) => {
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
    });
    return state;
  }

  getCountryFromPlace(place: any) {
    let country = '';
    place.address_components.forEach((component: any) => {
      if (component.types.includes('country')) {
        country = component.long_name;
      }
    });
    return country;
  }

  getPincodeFromPlace(place: any) {
    let pincode = '';
    place.address_components.forEach((component: any) => {
      if (component.types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });
    return pincode;
  }

  onCityInputChange(event: any) {
    this.initializeAutocomplete();
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
        terms: [1, Validators.required],
        isEmailVerified: [null, Validators.required],
      },

    );
  }

  showApply = false;
  validCoupon = false;

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
          this.validCoupon = true;
          this.talliteProductId = res['data'].list[0].id;
        } else {
          const obj = this.masters.talliteBusinessProductList.find((ele: any) => ele.shortCode === "TM199");
          this.couponCardList = jsonDeepParse(obj.childProductList);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res['message'] });
          this.validCoupon = false;
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

  talliteProductId: any = null;

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


  next(val: number, type?: number): void {

    if (type === 0) {
      if ((this.employer_form.get('sellerCompanyName')?.value && this.fileList.length &&
        this.verification_status && this.employer_form.get('websiteUrl')?.valid)) {
        if (val == 1) {
          if (!this.is_uploaded) {
            this.onUpload(1)
          }
        }
        console.log(this.employer_form.get('productTypeId')?.value);
        this.current += val;
        console.log(this.current)
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else {
        if (!this.employer_form.get('sellerCompanyName')?.value) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Company name is required' });
        } else if (!this.fileList.length) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Registration documentation is required' });
        } else if (!this.verification_status) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'ShortCode is required' });
        } else if (!this.employer_form.get('websiteUrl')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Website url is incorect' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form is invalid' });
        }

      }
    } else if (type === 1) {
      if ((this.employer_form.get('firstName')?.valid &&
        this.employer_form.get('lastName')?.valid &&
        this.employer_form.get('mobileNumber')?.valid &&
        this.employer_form.get('emailId')?.valid
        && this.email_verification.verification)) {
        if (val == 1) {
          if (!this.is_uploaded) {
            this.onUpload(1)
          }
        }
        console.log(this.employer_form.get('productTypeId')?.value);
        this.current += val;
        console.log(this.current)
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else {
        if (!this.employer_form.get('firstName')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'First name is required' });
        } else if (!this.employer_form.get('mobileNumber')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Mobile number is required' });
        } else if (!this.employer_form.get('emailId')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Email ID is required' });
        } else if (!this.email_verification.verification) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Email ID Verification required' });
        } else if (!this.employer_form.get('lastName')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Last name is not valid' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form is invalid' });
        }
      }
    } else if (type === 2) {
      if ((this.employer_form.get('addressLine1')?.valid &&
        this.employer_form.get('addressLine2')?.valid &&
        this.employer_form.get('city')?.valid &&
        this.employer_form.get('state')?.valid &&
        this.employer_form.get('country')?.valid &&
        this.employer_form.get('postalCode')?.valid)) {
        if (val == 1) {
          if (!this.is_uploaded) {
            this.onUpload(1)
          }
        }
        console.log(this.employer_form.get('productTypeId')?.value);
        this.current += val;
        console.log(this.current)
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else {
        if (!this.employer_form.get('addressLine2')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Address is required' });
        } else if (!this.employer_form.get('city')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'City is required' });
        } else if (!this.employer_form.get('state')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'State is required' });
        } else if (!this.employer_form.get('country')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Country is required' });
        } else if (!this.employer_form.get('postalCode')?.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Postal code is required' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form is invalid' });
        }
      }
    } else if (type === 3) {
      if ((this.checkPassword() != 'error' && this.employer_form.get('confirmpassword')?.valid)) {
        if (val == 1) {
          if (!this.is_uploaded) {
            this.onUpload(1)
          }
        }
        console.log(this.employer_form.get('productTypeId')?.value);
        this.current += val;
        console.log(this.current)
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else {
        if (!(this.employer_form.get('password')?.valid)) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Pasword is required' });
        }
        else if (!(this.checkPassword() != 'error')) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Password and Re-enter Pasword does not match' });
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form is invalid' });
        }
      }
    }
  }

  // nextAddress(){
  //   this.initializeAutocomplete();
  // }

  done(): void {
    console.log('done');
  }

  is_uploaded = false;

  handleChange(event: any) {

    console.log(event)
    this.fileList = event?.currentFiles;
    console.log(this.fileList)
    this.is_uploaded = false;
    if (event) {
      this.msg = '';
    }

  }

  convertFilesToBase64(files: any) {
    return new Observable((obs) => {
      if (files && files.length) {
        let converted = [];
        for (let i = 0; i < files.length; i++) {
          if (files[i]) {
            let reader = new FileReader();

            reader.onload = () => {
              let file = new StandardFile();
              let extension;
              try {
                let length = files[i].name.split('.').length;
                extension = files[i].name.split('.') ? files[i].name.split('.')[length - 1] : '';
                if (extension) {
                  extension = extension.toLowerCase();
                }
              }
              catch (err) {
                extension = '';
              }

              file.setFileDetails(files[i].name, files[i].type, reader.result, extension, 1, 0, files[i].size, 1, null)
              converted.push(file);
              if (files.length == converted.length) {
                obs.next(converted);
              }
            }
            reader.readAsDataURL(files[i]);
          }
        };
      }
      else {
        obs.next([]);
      }
    })
  }

  onOtpChange(event: any) {
    console.log(event);
    console.log(event.value.length);
    if (event.value.length == this.otpLength) {
      this.optInputLength = event.value.length;
      this.otp = event.value;
      console.log(this.otp);
      this.VerifyOTP();
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

  sending_otp = false;

  verifyEmailID(): void {
    if (this.sending_otp) {
      return;
    }

    // Ensure that the emailId control is valid before proceeding
    if (this.employer_form.controls['emailId'].valid) {
      const emailId = this.employer_form.value.emailId;
      const req = {
        emailId,
        isRegistration: 1,
      };

      console.log(req);
      this.sending_otp = true;

      // Sending OTP request
      this.registration.sendOTP(req).subscribe({
        next: (res: { status?: boolean; message?: string; data?: { otpLength?: number } }) => {
          this.sending_otp = false;

          if (res?.status) {
            console.log(res);
            this.otpLength = res.data?.otpLength ?? 6; // Default to 6 if otpLength is undefined
            this.viewOtpfield = true;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message || 'An error occurred' });
          }
        },
        error: (err) => {
          this.sending_otp = false;
          console.error('Error sending OTP:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send OTP. Please try again later.' });
        }
      });
    } else {
      this.sending_otp = false;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter a valid Email ID to proceed' });
    }
  }


  otpLength: number = 6;
  optInputLength!: number;

  VerifyOTP() {
    console.log(this.otpLength);
    console.log(this.optInputLength);
    if (this.optInputLength == this.otpLength) {
      this.verifyOtp();
    }else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please Enter a valid OTP' });
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
          this.next(1, this.current);

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

  executeSubmission() {
    if (!this.employer_form.get('prepaidCode')?.value) {
      this.showApply = false;
    }
    if ((this.showApply ? (this.talliteProductId != null) && this.employer_form.get('terms')?.value && this.validCoupon : (this.talliteProductId != null) && this.employer_form.get('terms')?.value)) {
      this.onSubmit();
    } else {
      if (this.showApply) {
        if (this.talliteProductId === null) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a plan to proceed' });
        } else if (!this.employer_form.get('terms')?.value) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please accept the the term and condition' });
        } else if (!this.validCoupon) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please apply any coupon' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form is invalid' });
        }

      } else {
        if (!this.employer_form.get('terms')?.value) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please accept the the term and condition ' });
        } else if (this.talliteProductId === null) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a plan to proceed' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select plan and accept terms and conditions' });
        }
      }
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
              // this.router.navigate(['/reg-success'], { queryParams: { data: serializedObj } });
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
              this.loader_flag = false;
            }
          } else {

            // this.router.navigate(['/reg-failed'], { queryParams: { message: res['message'] } });
            this.messageService.add({ severity: 'error', summary: 'Error', detail: res['message'] });
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
      prepaidCode: this.employer_form.value.prepaidCode,
    })
    this.registration
      .proceedToPay({
        inputAmount: this.employer_form.value.annualSubscription,
        currency: this.employer_form.value.annualSubscriptionCurrency,
        regLicenseKey: data?.regLicenseKey,
        talliteProductId: this.talliteProductId,
        emailId: this.employer_form.value.emailId,
        prepaidCode: this.employer_form.value.prepaidCode,
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
  removeFile(ev: any) {
    this.fileList = this.fileList.filter((f: any) => f !== ev.file);
  }

  // Handles the upload process
  onUpload(event: any) {
    console.log(event);
    // Logic to upload files to a server
    console.log('Files uploaded:', this.fileList);
    if (this.fileList?.length) {
      this.convertFilesToBase64(this.fileList).subscribe(res => {
        this.file_src.saveAttachments(res, 1).subscribe((files: any) => {
          console.log(files)
          if (files?.length) {
            this.employer_form.get(['registrationDocuments'])?.patchValue(files.map((f: any) => {
              return {
                cdnPath: f.a_url,
                fileName: f.a_fn
              }
            }))
            console.log(this.employer_form.get(['registrationDocuments'])?.value)
          }
        })
      })
    }


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

  totalSize: number = 0;

  totalSizePercent: number = 0;
  choose(event: any, callback: any) {
    callback();
  }

  onRemoveTemplatingFile(event: any, file: any, removeFileCallback: any, index: any) {
    removeFileCallback(event, index);
    this.totalSize -= parseInt(this.formatSize(file.size));
    this.totalSizePercent = this.totalSize / 10;
  }

  onClearTemplatingUpload(clear: any) {
    clear();
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  onTemplatedUpload() {
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
  }

  onSelectedFiles(event: any) {
    this.files = event.currentFiles;
    this.files.forEach((file: any) => {
      this.totalSize += parseInt(this.formatSize(file.size));
    });
    this.totalSizePercent = this.totalSize / 10;
  }

  uploadEvent(callback: any) {
    callback();
  }

  formatSize(bytes: any) {
    const k = 1024;
    const dm = 3;
    const sizes: any = this.config.translation.fileSizeTypes;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
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


export class StandardFile {
  fileName: any;
  mime_type: any;
  content: any;
  extension: any;
  status: any;
  attachment_id: any;
  size: any;
  cdnPath: any;
  content_type: any;
  setFileDetails(fileName: any, mime_type: any, content: any, extension: any, status: any, attachment_id: any, size: any, content_type: any, cdnPath: any) {
    this.fileName = fileName;
    this.mime_type = mime_type;
    this.content = content;
    this.extension = extension;
    this.status = status;
    this.attachment_id = attachment_id;
    this.size = size;
    this.content_type = content_type || 1;
    this.cdnPath = cdnPath;
  }

  constructor(obj = {
    fileName: null,
    mime_type: null,
    content: null,
    status: null,
    attachment_id: null,
    extension: null,
    size: null,
    content_type: null,
    cdnPath: null,
  }) {
    this.fileName = obj.fileName;
    this.mime_type = obj.mime_type;
    this.content = obj.content;
    this.extension = obj.extension;
    this.status = obj.status;
    this.attachment_id = obj.attachment_id;
    this.size = obj.size;
    this.content_type = obj.content_type || 1;
    this.cdnPath = obj.cdnPath;
  }
}
