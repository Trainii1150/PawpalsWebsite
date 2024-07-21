import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrl: './forgetpassword.component.css'
})
export class ForgetpasswordComponent {
  forgotPasswordForm: FormGroup;
  constructor(private fb: FormBuilder,private authService: AuthService,private route: ActivatedRoute, private router: Router){
    this.forgotPasswordForm = this.fb.group({
      email:['',[ Validators.required, Validators.email]]
    });
  }
  ngOnInit(): void {
  }

  onSubmit():void {
    if(this.forgotPasswordForm.valid){
      console.log(this.forgotPasswordForm.value);
      this.authService.forgetpassword(this.forgotPasswordForm.value)
        .subscribe(
          () =>{
            Swal.fire({
              title: 'Success!',
              text: 'Password reset link sent to your email.',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              // Redirect to login page
              this.router.navigate(['/login']);
            });
          },
          (error) => {
            console.error(error);
            if(error.status === 404){
              Swal.fire({
                title: 'Error!',
                text: 'Email not found',
                icon: 'error',
                confirmButtonText: 'OK'
              }).then(() => {
                // Redirect to login page
                this.router.navigate(['/login']);
              });
            }
            else{
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
              }).then(() => {
                // Redirect to login page
                this.router.navigate(['/login']);
              });
            }
          }
        )
      //alert('Password reset link sent to your email.');
    }
  };
}
