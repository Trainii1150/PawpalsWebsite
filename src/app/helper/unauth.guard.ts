import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class UnauthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isloggedin()) {
      // ยังไม่ได้เข้าสู่ระบบ
      return true; // อนุญาตให้เข้าถึง route นี้ได้ แต่ไม่อนุญาตให้เข้าถึงหน้า Home
    } else {
      // เข้าสู่ระบบแล้ว
      this.router.navigate(['/']); // Redirect ไปที่หน้า Home หรือหน้าอื่นที่เหมาะสม
      return false; // ไม่อนุญาตให้เข้าถึง route นี้
    }
  }
}