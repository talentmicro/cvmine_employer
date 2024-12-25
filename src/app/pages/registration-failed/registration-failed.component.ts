import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-registration-failed',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './registration-failed.component.html',
  styleUrl: './registration-failed.component.scss'
})
export class RegistrationFailedComponent implements OnInit{
  message='';
  constructor(private router:Router,private route:ActivatedRoute){}
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        this.message = JSON.parse(params['message']);
      
        console.log(this.message); // Your object
      }
    });
  }

  registartion(){
    this.router.navigate(['/employer']);
  }

}
