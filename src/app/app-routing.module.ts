import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './helper/auth.guard';
import { UnauthGuard } from './helper/unauth.guard';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent ,canActivate:[UnauthGuard]},
  { path: 'register', component: RegisterComponent ,canActivate:[UnauthGuard]},
  { path: 'forget-password', component:ForgetpasswordComponent,canActivate:[UnauthGuard]},
  { path: 'reset-password', component: ResetpasswordComponent},
  { path: 'verify-email', component: VerifyEmailComponent},
  { path: '', component:HomeComponent,canActivate:[AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }