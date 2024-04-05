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
      this.getdata();
    }
    getdata(){
      this.authService.fetchuserdata().subscribe(
        (data)=>{
          console.log(data);
        },
        (error)=>{
          console.error(error);
        }
      )
    }
}
