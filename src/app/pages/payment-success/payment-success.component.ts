import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent {
  countdown: number = 20;
  baseUrl: string = 'https://jsrating.com/search';
  translations: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startCountdown();
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.goToBase();
      }
    }, 1000);
  }

  goToBase() {
    const currentUrl = window.location.href;
      this.baseUrl = 'https://employer-uat.cvmine.com/';
    window.location.href = this.baseUrl;
  }
}
