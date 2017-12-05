export const environment = {
  production: true,

  // loaded from /public/config.json
  awsConfig: {
    Region: '',

    S3: {
      Bucket: ''
    },

    Cognito: {
      UserPool: '',
      UserPoolClient: '',
      IdentityPool: '',
    },
  },
};
