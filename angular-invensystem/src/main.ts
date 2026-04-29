import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
// 1. Change the import to look for app.component and AppComponent
import { AppComponent } from './app/app'; 

// 2. Bootstrap AppComponent instead of App
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));