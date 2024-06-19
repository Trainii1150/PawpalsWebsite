import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class UnauthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isloggedin()) {
      this.router.navigate(['/']); // ถ้าเข้าสู่ระบบแล้วให้ redirect ไปที่หน้าหลัก
      return false;
    }
    return true; // ยังไม่เข้าสู่ระบบ จึงอนุญาตให้เข้าถึง
  }
}