import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { share, tap } from 'rxjs/operators';

import { AwsConfiguration } from './aws-configuration.interface';
import { environment } from '../../environments/environment';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AwsConfigurationService {
  private config?: AwsConfiguration;
  private configUrl = '/public/config.json';

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
  ) {}

  fetch(): Observable<AwsConfiguration> {
    if (isDevMode() && !this.config) {
      this.logger.log('loading aws-configuration from environment');
      this.config = environment.awsConfig;
    }

    if (this.config) {
      this.logger.log('aws-configuration is already loaded');
      return of(this.config).pipe(share());
    }

    return this.http.get<AwsConfiguration>(this.configUrl).pipe(
      tap(
        config => {
          this.logger.log('fetched aws-configuration');
          this.config = config;
        },

        error => {
          this.logger.log(error);
        },
      ),

      share(),
    );
  }
}
