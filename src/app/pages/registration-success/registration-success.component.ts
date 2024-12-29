import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './registration-success.component.html',
  styleUrl: './registration-success.component.scss'
})
export class RegistrationSuccessComponent implements OnInit {
  constructor(private router:Router,private route:ActivatedRoute){}
  data: any;
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        this.data = JSON.parse(params['data']);
      
        console.log(this.data); // Your object
      }
    });
  }
  home() {
    this.router.navigate(['/login']);
  }
}
