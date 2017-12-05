import { Injectable } from '@angular/core';

import { S3 } from 'aws-sdk';

import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operators/map';
import { mergeMap } from 'rxjs/operators/mergeMap';

import { AwsConfigurationService } from '../aws-configuration/aws-configuration.service';
import { CognitoService } from '../cognito/cognito.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class S3Service {
  private bucket: string;

  constructor(
    private awsConfiguration: AwsConfigurationService,
    private cognito: CognitoService,
    private logger: LoggerService,
  ) {
    awsConfiguration.fetch().subscribe(
      (config) => {
        this.bucket = config.S3.Bucket;
      },

      error => {
        this.logger.log('cannot initiate s3 service');
        this.logger.log(error);
      },
    );
  }

  getObject(key: string): Observable<string> {
    return this.getS3Client().pipe(
      mergeMap(s3 => {
        return s3.getObject({
          Bucket: this.bucket,
          Key:    key,
        }).promise();
      }),

      map(getObjectResult => {
        return (getObjectResult.Body || '').toString();
      }),
    );
  }

  putObject(key: string, body: string, contentType: string): Observable<any> {
    return this.getS3Client().pipe(
      mergeMap(s3 => {
        return s3.putObject({
          Bucket:      this.bucket,
          Key:         key,
          Body:        body,
          ContentType: contentType,
        }).promise();
      })
    );
  }

  private getS3Client(): Observable<S3> {
    return forkJoin(
      this.awsConfiguration.fetch(),
      this.cognito.getCredentials(),
    ).pipe(map(
      ([config, credentials]) => {
        return new S3({credentials, region: config.Region});
      }
    ));
  }
}
