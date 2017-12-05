import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { LoggerService } from '../logger/logger.service';
import { AwsConfigurationService } from '../aws-configuration/aws-configuration.service';
import { AwsConfiguration } from '../aws-configuration/aws-configuration.interface';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {
  awsConfiguration$?: Observable<AwsConfiguration>;

  constructor(
    private logger: LoggerService,
    private awsConfiguration: AwsConfigurationService,
  ) { }

  ngOnInit() {
    this.logger.log('config component init');
    this.awsConfiguration$ = this.awsConfiguration.fetch();
  }
}
