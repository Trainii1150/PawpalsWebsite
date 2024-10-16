import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  title = 'PawpalsWebsite';
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en'); 
}
  switchLanguage(language: string) {
    this.translate.use(language); 
  }
}