import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.css'
})
export class ResetpasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  email: string | null = null;
  token: string | null = null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private authService: AuthService){
    this.resetPasswordForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      password: ['',[Validators.required, Validators.minLength(8)]],
      repeatPassword: ['',[Validators.required]],
    },{validators :this.passwordMatchValidator});
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>{
      this.token = params['token'];
      this.email = params['email'];
      if(this.email && this.token){
        this.resetPasswordForm.patchValue({email : this.email});
          this.authService.validateResetToken(this.token).subscribe(
            (response)=>{
              console.log(response);
            },
            (error)=>{
              if (error.status === 400 || error.status === 401) {
                console.log(error,'dsdasdsads');
                Swal.fire({
                  icon: 'error',
                  title: 'Token Expired',
                  text: 'The reset token has expired or not found. Please request a new password reset link.',
                  confirmButtonText: 'Ok'
                }).then(() => {
                  this.router.navigate(['/login']);
                });
              }
            }
          )

      } else{
        Swal.fire({
          icon: 'error',
          title: 'Invalid Link',
          text: 'The reset password link is missing required parameters. Please check your email for the correct link or request a new one.',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const repeatPassword = group.get('repeatPassword')?.value;

    return password === repeatPassword ? null : { passwordMismatch: true };
  }

  onSubmit():void{
    if(this.resetPasswordForm.valid,this.email){
      //alert('Your password has been reset');
      const {password} = this.resetPasswordForm.value;
      this.authService.resetpassword(this.email, password).subscribe(
        () =>{
          Swal.fire({
            icon: 'success',
            title: 'Password Reset Successful',
            text: 'Your password has been reset successfully. You can now log in.',
            confirmButtonText: 'Ok'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        (error)=>{
          Swal.fire({
            icon: 'error',
            title: 'Password Reset Failed',
            text: 'An error occurred while resetting your password. Please try again later.',
            confirmButtonText: 'Ok'
          });
        }
      )
    } else{
      Swal.fire({
        icon: 'error',
        title: 'Invalid Data',
        text: 'Please ensure all fields are filled out correctly.',
        confirmButtonText: 'Ok'
      });
    }
  }
}
