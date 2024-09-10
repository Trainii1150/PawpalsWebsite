import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isloggedin()) {
        //เข้าสู่ระบบแล้ว
        return true; //อนุญาตให้เข้าถึง route หรือหน้า Home นี้
      } else {
        // ยังไม่ได้เข้าสู่ระบบ
        this.router.navigate(['/login']); // redirect ไปที่หน้า Login
        return false;// ไม่อนุญาตให้เข้าถึง route หรือหน้า Home นี้
      }
  }

}