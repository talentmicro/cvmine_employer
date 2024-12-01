import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { LoginService } from '../services/auth/login.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
    standalone: true,
    imports: [
        RouterLink, 
        ReactiveFormsModule,
        CommonModule, 
        NavbarComponent, 
        FooterComponent,
        InputTextModule,
        ToastModule
    ],
    providers: [LoginService, MessageService]
})

export class LoginPageComponent implements OnInit{
    isPasswordVisible: boolean = false;
    loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private loginService: LoginService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.loginForm = this.fb.group({
            employeeId: ['', [Validators.required]],
            password: ['', [
                Validators.required,
                Validators.minLength(6),
                // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
            ]]
        });
    }

    ngOnInit(): void {
        
    }

    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const { employeeId, password } = this.loginForm.value;

            this.loginService.login(employeeId, password).subscribe(
                (response) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.router.navigate(['/dashboard']);
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
                }
            );
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Invalid', detail: 'Form is invalid!' });
        }
    }

}