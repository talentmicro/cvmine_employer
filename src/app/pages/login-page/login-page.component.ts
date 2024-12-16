import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../services/auth/login.service';
import { MessageService } from 'primeng/api';
import { ImportsModule } from '../../imports';
import { ApiService } from '../services/api.service';
@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
    standalone: true,
    imports: [
        RouterLink, 
        ReactiveFormsModule,
        CommonModule, 
        ImportsModule,
    ],
    providers: [LoginService, MessageService]
})

export class LoginPageComponent{
    isPasswordVisible: boolean = false;
    visible: boolean = false;
    newPasswordVisible: boolean = false;
    confirmNewPasswordVisible: boolean = false;
    display: boolean = false;
    verificationCodeVisible: boolean = false;
    forgotPasswordForm: FormGroup;
    step: number = 1;
    loading: boolean = false;
    loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private loginService: LoginService,
        private router: Router,
        private messageService: MessageService,
        private apiService: ApiService
    ) {
        this.loginForm = this.fb.group({
            employeeId: ['', [Validators.required]],
            password: ['', [
                Validators.required,
                Validators.minLength(6),
                // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
            ]]
        });

        this.forgotPasswordForm = this.fb.group({
            userID: [{value: '', disabled: false}, [Validators.required]],
            verificationCode: [''],
            newPassword: [''],
            confirmNewPassword: ['']
        });
    }

    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const { employeeId, password } = this.loginForm.value;

            this.loginService.login(employeeId, password).subscribe(
                (response) => {
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.router.navigate(['/job-listings']);
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                }
            );
        } else {
            this.loginForm.markAllAsTouched();
            // this.messageService.add({ severity: 'warn', summary: 'Invalid', detail: 'Form is invalid!' });
        }
    }

    onPasswordReset() {
        if (this.step === 1) {
            this.checkUserID();
        } else if (this.step === 2) {
            this.verifyCode();
        } else if (this.step === 3) {
            this.resetPassword();
        }
    }
    
    checkUserID() {
        this.loading = true;
        this.forgotPasswordForm.get('userID')?.setValidators([Validators.required]);
        this.forgotPasswordForm.get('userID')?.updateValueAndValidity();
        if (this.forgotPasswordForm.get('userID')?.invalid) {
            this.loading = false;
            return;
        }
        const body =  {
            "employeeId": this.forgotPasswordForm.get('userID')?.value
        }
        this.apiService.checkUserID(body).subscribe({
            next: (response) => {
                if(response.status) {
                    this.loading = false;
                    this.step = 2;
                    this.forgotPasswordForm.get('userID')?.disable();
                    this.forgotPasswordForm.get('verificationCode')?.setValidators([Validators.required]);
                    this.forgotPasswordForm.get('verificationCode')?.updateValueAndValidity();
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                } else {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                }
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to send verification code.' });
            }
        });
    }

    resendCode() {
        const body =  {
            "employeeId": this.forgotPasswordForm.get('userID')?.value
        }
        this.apiService.checkUserID(body).subscribe({
            next: (response) => {
                if(response.status) {
                    this.loading = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                } else {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                }
                
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to send verification code.' });
            }
        });
    }
    
    verifyCode() {
        this.loading = true;
        if (this.forgotPasswordForm.get('verificationCode')?.invalid) {
            this.loading = false;
            return;
        }
        const body = {
            "otp": this.forgotPasswordForm.get('verificationCode')?.value,
            "employeeId": this.forgotPasswordForm.get('userID')?.value
        } 
        this.apiService.verifyCode(body).subscribe({
            next: (response) => {
                if(response.status) {
                    this.loading = false;
                    this.step = 3;
                    this.forgotPasswordForm.get('newPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
                    this.forgotPasswordForm.get('confirmNewPassword')?.setValidators([Validators.required]);
                    this.forgotPasswordForm.get('newPassword')?.updateValueAndValidity();
                    this.forgotPasswordForm.get('confirmNewPassword')?.updateValueAndValidity();
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                } else {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                }
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Invalid verification code.' });
            }
        });
    }
    
    resetPassword() {
        this.loading = true;
        if (this.forgotPasswordForm.invalid) {
            this.loading = false;
            return;
        }
        const newPassword = this.forgotPasswordForm.get('newPassword')?.value;
        const confirmNewPassword = this.forgotPasswordForm.get('confirmNewPassword')?.value;
        if (newPassword !== confirmNewPassword) {
            this.loading = false;
            this.messageService.add({ severity: 'warn', summary: 'Invalid', detail: 'Passwords do not match.' });
            return;
        }
        const body = {
            "employeeId": this.forgotPasswordForm.get('userID')?.value,
            "otp": this.forgotPasswordForm.get('verificationCode')?.value,
            "newPassword": this.forgotPasswordForm.get('newPassword')?.value
        }

        this.apiService.resetPassword(body).subscribe({
            next: (response) => {
                if(response.status) {
                    this.loading = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    this.closeDialog();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
                    return;
                }
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to reset password.' });
            }
        });
    }

    showDialog() {
        this.display = true;
    }

    closeDialog() {
        this.step = 1;
        this.forgotPasswordForm.reset();
        this.forgotPasswordForm.get('userID')?.enable();
        this.display = false;
    }

    toggleVerificationCodeVisibility() {
        this.verificationCodeVisible = !this.verificationCodeVisible;
    }

    toggleNewPasswordVisibility(): void {
        this.newPasswordVisible = !this.newPasswordVisible;
    }

    toggleConfirmNewPasswordVisibility(): void {
        this.confirmNewPasswordVisible = !this.confirmNewPasswordVisible;
    }
}