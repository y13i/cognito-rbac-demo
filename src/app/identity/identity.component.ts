import { Component, OnInit } from '@angular/core';

import { STS } from 'aws-sdk';

import { mergeMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { CognitoService } from '../cognito/cognito.service';
import { AwsConfigurationService } from '../aws-configuration/aws-configuration.service';
import { LoggerService } from '../logger/logger.service';
import { subscribe } from 'graphql/subscription/subscribe';

@Component({
  selector: 'app-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.css']
})
export class IdentityComponent implements OnInit {
  loading = true;
  succeed = false;

  message?: string;
  identity?: STS.GetCallerIdentityResponse;

  constructor(
    private logger:           LoggerService,
    private cognito:          CognitoService,
    private awsConfiguration: AwsConfigurationService,
  ) {}

  ngOnInit() {
    this.logger.log('identity component init');

    forkJoin(
      this.cognito.getCredentials(),
      this.awsConfiguration.fetch(),
    ).pipe(
      mergeMap(([credentials, config]) => {
        const region = config.Region;
        const sts = new STS({credentials, region});

        return sts.getCallerIdentity({}).promise();
      }),
    ).subscribe(
      getCallerIdentityResult => {
        this.loading = false;
        this.succeed = true;
        this.identity = getCallerIdentityResult;
      },

      error => {
        this.message = error.message;
        this.loading = false;
      }
    );
  }
}
