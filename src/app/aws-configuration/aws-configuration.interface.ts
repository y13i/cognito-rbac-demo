export interface AwsConfiguration {
  Region: string;

  S3: {
    Bucket: string;
  };

  Cognito: {
    UserPool: string;
    UserPoolClient: string;
    IdentityPool: string;
  };
}
