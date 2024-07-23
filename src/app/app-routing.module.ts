import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { NotFoundComponent } from './not-found/not-found.component';

// Page Guarding
import { AuthGuard } from './helper/auth.guard';
import { UnauthGuard } from './helper/unauth.guard';
import { AdminRoleGuard } from './helper/adminrole.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent ,canActivate:[UnauthGuard]},
  { path: 'register', component: RegisterComponent ,canActivate:[UnauthGuard]},
  { path: 'forget-password', component:ForgetpasswordComponent,canActivate:[UnauthGuard]},
  { path: 'reset-password', component: ResetpasswordComponent},
  { path: 'verify-email', component: VerifyEmailComponent},
  { path: 'admin/dashboard', component: DashboardComponent ,canActivate:[AuthGuard,AdminRoleGuard]},
  { path: '', component:HomeComponent,canActivate:[AuthGuard]},
  { path: '**', component:NotFoundComponent}// Wildcard route for 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }