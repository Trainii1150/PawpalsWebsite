import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit  {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder,  private authService: AuthService , private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeatPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }
  ngOnInit(): void {
  }
  
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const repeatPassword = group.get('repeatPassword')?.value;

    return password === repeatPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
        const { username,email ,password } = this.registerForm.value;
        this.authService.register(username,email,password).subscribe(
            (response) => {
                // Handle successful registration
                console.log('Registration successful', response);

                // Show SweetAlert2 success message
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: 'You have successfully registered.',
                    confirmButtonText: 'Back to Login',
                }).then((result)=>{
                  if(result.isConfirmed){
                    // Redirect to the login page
                    this.router.navigate(['/login']);
                  }
                })
            },
            (error) => {
                // Handle registration error
                console.error('Registration failed', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Registration Failed',
                  text: 'An error occurred during registration. Please try again.',
              });
            }
        );
        
    }
    else{
      Swal.fire({
        icon: 'warning',
        title: 'Registration Failed',
        text: 'Please enter all the required fields to register.',
      });
    }
  }
}
