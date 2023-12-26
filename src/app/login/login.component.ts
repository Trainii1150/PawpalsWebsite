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
  
  onSubmit(){
    //console.log(this.loginForm.value);
    if(this.loginForm.value){
      const {email, password} = this.loginForm.value;
      this.authService.login(email,password).subscribe(
        (response) => {
            // Handle successful registration
            console.log('Registration successful', response);

            // Show SweetAlert2 success message
            Swal.fire({
              icon: 'success',
              title: 'Login Successful!',
              text: 'You have successfully logged in.',
              confirmButtonText: 'Ok',
            }).then((result)=>{
              if(result.isConfirmed){
                this.router.navigate(['/home']);
              }
            })

           
        },
        (error) => {
            //console.error('Registration failed', error);
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: 'Invalid email or password. Please try again.',
            });
        }
      );
    }
  }
}
