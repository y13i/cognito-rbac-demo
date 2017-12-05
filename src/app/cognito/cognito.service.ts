import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map, mergeMap, share } from 'rxjs/operators';

import {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUser,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

import {
  CognitoIdentity,
  CognitoIdentityCredentials,
} from 'aws-sdk';

import { AwsConfigurationService } from '../aws-configuration/aws-configuration.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CognitoService {
  user?: CognitoUser;

  private userPool?: CognitoUserPool;

  constructor(
    private awsConfiguration: AwsConfigurationService,
    private logger: LoggerService,
  ) {
    this.getCurrentUser().subscribe(u => this.user = u);
  }

  getSession(): Observable<CognitoUserSession> {
    return fromPromise(new Promise((resolve, reject) => {
      if (!this.user) {
        reject(new Error('currentUser is not present.'));
      } else {
        this.user.getSession((error: any, session: CognitoUserSession) => {
          error ? reject(error) : resolve(session);
        });
      }
    }));
  }

  authenticateUser(username: string, password: string): Observable<CognitoUserSession> {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    return this.getUserPool().pipe(
      mergeMap(userPool => {
        const user = new CognitoUser({
          Username: username,
          Pool:     userPool,
        });

        this.user = user;

        return new Promise((resolve, reject) => {
          user.authenticateUser(authenticationDetails, {
            onSuccess(session) {
              resolve(session);
            },

            onFailure(error) {
              reject(error);
            },
          });
        });
      }),
    );
  }

  getCredentials(): Observable<CognitoIdentityCredentials> {
    return forkJoin(
      this.getSession(),
      this.awsConfiguration.fetch(),
    ).pipe(
      map(([session, config]) => {
        const Logins: CognitoIdentity.LoginsMap = {};
        const loginsMapKey = `cognito-idp.${config.Region}.amazonaws.com/${config.Cognito.UserPool}`;
        Logins[loginsMapKey] = session.getIdToken().getJwtToken();

        return new CognitoIdentityCredentials({
          Logins,

          IdentityPoolId: config.Cognito.IdentityPool,
        }, {
          region: config.Region,
        });
      })
    );
  }

  private getUserPool(): Observable<CognitoUserPool> {
    if (this.userPool) {
      return of(this.userPool).pipe(share());
    } else {
      return this.awsConfiguration.fetch().pipe(
        map(config => {
          const userPool = new CognitoUserPool({
            UserPoolId: config.Cognito.UserPool,
            ClientId:   config.Cognito.UserPoolClient,
          });

          this.userPool = userPool;

          return userPool;
        }),

        share(),
      );
    }
  }

  private getCurrentUser(): Observable<CognitoUser | undefined> {
    return this.getUserPool().pipe(map(userPool => userPool.getCurrentUser() || undefined));
  }
}
