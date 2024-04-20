// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;


  constructor(private fb: FormBuilder ,private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  ngOnInit():void {}
  
  onSubmit():void{
    //console.log(this.loginForm.value);
    if(this.loginForm.value){
      const {email, password} = this.loginForm.value;
      this.authService.login(email,password).subscribe(
        (response) => {
            // Handle successful registration
            console.log(response);
            this.showLoginSuccess(response);          
        },
        (error) => {
            //console.error('Registration failed', error);
            if (error.status === 400){
              this.showResendEmailVerifyWarning(email)
            } else {
                Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid email or password. Please try again.',
              });
            }
            
        }
      );
    }
  }

  showLoginSuccess(req: Object): void{
    Swal.fire({
      icon: 'success',
      title: 'Login Successful!',
      text: 'You have successfully logged in.',
      confirmButtonText: 'Ok',
    }).then((result)=>{
      if(result.isConfirmed){
        this.authService.setLocalStorage(req);
        this.router.navigate(['/']);
      }
    });

  }

  showResendEmailVerifyWarning(email: string): void{
    Swal.fire({
      icon: 'warning',
      title: 'Email Not Verified',
      text: 'Your email is not verified. Resend verification email?',
      showCancelButton: true,
      confirmButtonText: 'Resend Email',
      cancelButtonText: 'Cancel',
    }).then((result)=>{
      if(result.isConfirmed){
        this.showResendEmailVerify(email)
      }
    });
  }

  showResendEmailVerify(email : string) :void{
    this.authService.sendVerifyEmail(email).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Verification Email Resent',
          text: 'Please check your email inbox for the verification email.',
          confirmButtonText: 'Ok',
        });
      },
      (error)=>{
        console.error('Failed to resend verification email', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while resending the verification email. Please try again later.',
        });
      }
    );
  }
}