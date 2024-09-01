import { Component,OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit{
  constructor(private router: Router,private authService: AuthService) {}

  ngOnInit():void {
    Swal.fire({
      icon: 'error',
      title: '404 Not Found',
      text: 'The page you are looking for does not exist.',
      confirmButtonText: 'Go to Login'
    }).then((result) => {
        if(result.isConfirmed){
          this.authService.logout();
          this.router.navigate(['/login']);
        }
    });
  }
}
