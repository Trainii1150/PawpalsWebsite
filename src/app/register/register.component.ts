import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit  {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeatPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const repeatPassword = group.get('repeatPassword')?.value;

    return password === repeatPassword ? null : { passwordMismatch: true };
  }

  onSubmit(){
    const modalDiv = document.getElementById('myModal');
    if (modalDiv != null){
      modalDiv.style.display = 'block'
      modalDiv.style.backgroundColor = '#3333'
    }
    if (this.registerForm.valid) {
      console.log('Form is valid!');
      console.log(this.registerForm.value);
    } else {
      console.log('Form is invalid.');
      console.log('Errors:', this.registerForm.errors); // This will log null or an object with errors
    }
    return false
  }
}
