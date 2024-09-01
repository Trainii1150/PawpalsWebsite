import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminRoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const role = 'admin';
    const userrole = this.authService.getRole();
    console.log(userrole);
    if (userrole === role) {
      return true;
    }

    // Show SweetAlert2 alert
    Swal.fire({
        title: 'Access Denied',
        text: 'You do not have permission to access this page.',
        icon: 'error',
        confirmButtonText: 'OK'
    }).then(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
    });
    return false;
  }
}
