import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Output, EventEmitter, Input, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    grecaptchaCallback: () => void;
  }
  
  interface Window {
    grecaptcha: {
      render: (elementId: string, options: {
        sitekey: string;
        callback: (response: string) => void;
        'expired-callback'?: () => void;
      }) => void;
    };
  }
}

@Component({
  selector: 'app-tm-captch',
  templateUrl: './tm-captch.component.html',
  styleUrls: ['./tm-captch.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TmCaptchComponent implements OnInit {
  valid_captcha_flag!: boolean;
  valid_captcha: any;
  @Input() class:any;
  @ViewChild('recaptcha', { static: true }) captch_element!: ElementRef;
  @Output() validCaptch = new EventEmitter<any>();
  random_id = 'tm-captcha' + Math.floor((Math.random() * 10000) + 1) + Date.now();

  constructor(
    private change_detector: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // Inject the PLATFORM_ID
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.addRecaptchaScript();
        console.log('hello');
      }
    });
  }

  addRecaptchaScript() {
    if (isPlatformBrowser(this.platformId)) {
      window['grecaptchaCallback'] = () => {
        this.renderReCaptch();
      };

      (function (d, s, id, obj) {
        let js:any, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { obj.renderReCaptch(); return; }
        js = d.createElement(s); js.id = id;
        js.src = "https://www.google.com/recaptcha/api.js?onload=grecaptchaCallback&render=explicit"; // Corrected & to avoid HTML entity
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'recaptcha-jssdk', this));
    }
  }

  renderReCaptch() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        window['grecaptcha'].render(this.random_id, {
          'sitekey': environment.RECAPCHA_KEY,
          'callback': (response:any) => {
            this.valid_captcha = response;
            this.valid_captcha_flag = true;
            console.log(this.valid_captcha);
            this.validCaptch.emit(true);
            this.change_detector.detectChanges();
          },
          'expired-callback': () => {
            this.expiredCallback();
          },
        });
      } catch (err) {
        setTimeout(() => {
          this.renderReCaptch();
        }, 200);
      }
    }
  }

  expiredCallback() {
    this.valid_captcha = "";
    this.valid_captcha_flag = false;
    this.validCaptch.emit(false);
    this.change_detector.detectChanges();
  }
}
