import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
// Import the PasswordStrengthValidator function
import { PasswordStrengthValidator } from './password-strength.validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit  {
  registerForm: FormGroup;
  isRegistered: boolean = false;

  constructor(private fb: FormBuilder,  private authService: AuthService , private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), PasswordStrengthValidator]],
      repeatPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }
  ngOnInit(): void {
    //Check if email is already registered
    this.registerForm.get('email')?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (this.registerForm.get('email')?.valid) {
            //console.log(value);
            return this.authService.checkEmailNotTaken(value);
          } else {
            return [null]; // Return a null observable if email is invalid
          }
        })
    ).subscribe(response => {
      if(response){
        this.isRegistered = true;
      }else{
        this.isRegistered = false;
      }
    });
  }
  
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const repeatPassword = group.get('repeatPassword')?.value;

    return password === repeatPassword ? null : { passwordMismatch: true };
  }

  onSubmit():void {
    if (this.registerForm.valid) {
        const { username,email ,password } = this.registerForm.value;
        this.authService.register(username,email,password).subscribe(
          () => { 
            this.authService.sendVerifyEmail(email).subscribe(
              () => {
                  this.showRegisterSuccess();
              },
              (error) => {
                // Handle verify registration error
                console.error('Failed to send verification email:', error);
                this.showRegisterError();
              }
            );           
          },
          (error) => {
              // Handle registration error
              console.error('Registration failed', error);
              this.showRegisterError();
          }
        );
        
    }
    else{
      this.showFormValidationError();
    }
  }

  showRegisterSuccess(): void{
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You have successfully registered. Please check your email for verification.',
        confirmButtonText: 'Back to Login',
      }).then((result)=>{
        if(result.isConfirmed){
          // Redirect to the login page
          this.router.navigate(['/login']);
        }
      })
  };


  showRegisterError(): void{
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'An error occurred during registration. Please try again.',
    });
  };

  showFormValidationError(): void{
      Swal.fire({
        icon: 'warning',
        title: 'Registration Failed',
        text: 'Please enter all the required fields to register.',
    });
  };
}
