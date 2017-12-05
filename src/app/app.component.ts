import { Component } from '@angular/core';

import { CognitoService } from './cognito/cognito.service';
import { LoggerService } from './logger/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Cognito Role-based Auth Demo';

  navLinks = [
    {label: 'Home', path: ''},
    {label: 'Config', path: 'config'},
    {label: 'Identity', path: 'identity'},
    {label: 'View', path: 'view'},
    {label: 'Edit', path: 'edit'},
  ];
}
