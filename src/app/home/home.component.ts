import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { LoggerService } from '../logger/logger.service';
import { AwsConfigurationService } from '../aws-configuration/aws-configuration.service';
import { AwsConfiguration } from '../aws-configuration/aws-configuration.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  config: AwsConfiguration;

  constructor(
    private logger: LoggerService,
    private awsConfiguration: AwsConfigurationService,
  ) { }

  ngOnInit() {
    this.logger.log('home component init');

    this.awsConfiguration.fetch().subscribe(config => {
      this.config = config;
    });
  }
}
