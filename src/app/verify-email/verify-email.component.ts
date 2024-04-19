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
            if (error.status === 400 && error.error && error.error.error === 'Token is expired or missing') {
              // Token expired, prompt user to resend verification email
              this.promptResendVerificationEmail();
            } else {
              // Other errors, display generic error message
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
        this.promptResendVerificationEmail();
      }
    })
  }

  promptResendVerificationEmail(): void {
    Swal.fire({
      icon: 'info',
      title: 'Verification Token Resent',
      text: 'The verification token has expired or not found. Would you like to resend the verification email?',
      showCancelButton: true,
      confirmButtonText: 'Resend Email',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to resend-verification-email page
        this.router.navigate(['/resend-verification-email']);
      } else {
        // Redirect to login page
        this.router.navigate(['/login']);
      }
    });
  }
    
}
