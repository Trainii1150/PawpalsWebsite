import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const verifytoken = params['token'];
      const email :string = params['email'];
      if(verifytoken){
        this.authService.verifyEmail(verifytoken).subscribe(
          (response) =>{
            Swal.fire({
              icon: 'success',
              title: 'Email Verified',
              text: 'Your email has been verified successfully.',
              confirmButtonText: 'Ok',
            }).then(() => {
              // Redirect to login page
              this.router.navigate(['/login']);
            });
          },
          (error) => {
            // Email verification failed
            console.error('Email verification failed', error);
            if (error.status === 401) {
                // Token expired, prompt user to resend verification email
                console.log('Token expired', error);
                this.promptResendVerificationEmail(email);            
            } 
            else if (error.status === 200){
                // Token expired, prompt user to resend verification email but Email is already verified
                Swal.fire({
                  icon: 'warning',
                  title: 'Email Verification Failed',
                  text: 'Email is already verified. Please return to the login page.',
                  confirmButtonText: 'Ok',
                }).then(() => {
                  // Redirect to login page
                  this.router.navigate(['/login']);
                });
            }
            else {
              // Other errors
              Swal.fire({
                icon: 'error',
                title: 'Email Verification Failed',
                text: 'An error occurred while verifying your email. Please try again later.',
                confirmButtonText: 'Ok',
              }).then(() => {
                // Redirect to login page
                this.router.navigate(['/login']);
              });
            }
          }
        )
      }
      else{
        Swal.fire({
          icon: 'error',
          title: 'Email Verification Failed',
          text: 'No token was found in the URL. Please make sure you have accessed the verification link correctly.',
          confirmButtonText: 'Ok',
        }).then(() => {
          // Redirect to login page
          this.router.navigate(['/login']);
        });
      }
    })
  }

  promptResendVerificationEmail(email :string): void {
    Swal.fire({
      icon: 'warning',
      title: 'Verification Token Expired',
      text: 'The verification token has expired. Would you like to resend the verification email?',
      showCancelButton: true,
      confirmButtonText: 'Resend Email',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to resend-verification-email page
        this.authService.sendVerifyEmail(email).subscribe(
          () =>{
            this.showResendVerificationEmailSuccess();
          },
        )
      } else {
        // Redirect to login page
        this.router.navigate(['/login']);
      }
    });
  }

  showResendVerificationEmailSuccess() :void {
    Swal.fire({
      icon: 'success',
      title: 'Email Resent Successfully',
      text: 'Please check your email for verification.',
    });
  }
    
}
