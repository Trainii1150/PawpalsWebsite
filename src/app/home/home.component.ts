import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    constructor(private authService: AuthService,private router: Router){}
    ngOnInit(){
      this.checkcredentials();
    }
    checkcredentials(){
      if(this.authService.isloggedin()){
        console.log("Auth is access");
      }
      else{
        //console.log("Failure");
        this.router.navigate(['/login']);
      }
    }
}
