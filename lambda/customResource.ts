import dalamb from 'dalamb';
import retryx from 'retryx';
import {cfnCustomResource, CustomResourceHandlerSet} from 'cfn-custom-resource-helper';

import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceUpdateEvent,
  CloudFormationCustomResourceDeleteEvent,
} from 'aws-lambda';

import {CognitoIdentity, S3} from 'aws-sdk';

import {basename, extname, join} from 'path';

import {
  readdirAsync,
  readFileAsync,
} from 'fs-extra-promise';

import {AwsConfiguration} from '../src/app/aws-configuration/aws-configuration.interface';

export default dalamb<CloudFormationCustomResourceEvent>(async (event, context) => {
  let handlers: CustomResourceHandlerSet;

  const s3 = new S3();

  switch (event.ResourceType) {
    case 'Custom::IdentityPoolRoleMapping': {
      const {
        IdentityPoolId,
        IdentityProviderName,
      }: {[k: string]: string} = event.ResourceProperties;

      const RoleMapping: CognitoIdentity.RoleMapping = event.ResourceProperties.RoleMapping;

      const cognitoIdentity = new CognitoIdentity();

      const identityPoolRoles = await retryx(() => cognitoIdentity.getIdentityPoolRoles({IdentityPoolId}).promise());

      const params = {...identityPoolRoles} as CognitoIdentity.SetIdentityPoolRolesInput;

      const upsert = async () => {
        try {
          if (!params.RoleMappings) {
            params.RoleMappings = {};
          }

          params.RoleMappings[IdentityProviderName] = RoleMapping;
          await retryx(() => cognitoIdentity.setIdentityPoolRoles(params).promise());
        } catch (e) {
          console.log(e);
          throw e;
        }
      };

      handlers = {
        async onCreate() {
          await upsert();

          return {id: IdentityProviderName};
        },

        async onUpdate(updateEvent) {
          await upsert();

          return {id: updateEvent.PhysicalResourceId};
        },

        async onDelete(deleteEvent) {
          if (params.RoleMappings) {
            delete params.RoleMappings[IdentityProviderName];
          }

          await retryx(() => cognitoIdentity.setIdentityPoolRoles(params).promise());

          return {id: deleteEvent.PhysicalResourceId};
        },

      };
    } break;

    case 'Custom::AwsConfiguration': {
      const {
        Bucket,
        Key,
      }: {[k: string]: string} = event.ResourceProperties;

      const awsConfiguration: AwsConfiguration = event.ResourceProperties.Content;

      const upsert = async () => {
        try {
          await retryx(() => s3.putObject({
            Bucket,
            Key,

            Body:        JSON.stringify(awsConfiguration),
            ContentType: 'application/json',
          }).promise());
        } catch (e) {
          console.log(e);
          throw e;
        }
      };

      handlers = {
        async onCreate() {
          await upsert();

          return {id: `s3://${Bucket}/${Key}`};
        },

        async onUpdate(updateEvent) {
          await upsert();

          return {id: updateEvent.PhysicalResourceId};
        },

        async onDelete(deleteEvent) {
          await retryx(() => s3.deleteObject({Bucket, Key}).promise());

          return {id: deleteEvent.PhysicalResourceId};
        },

      };
    } break;

    case 'Custom::AssetBundle': {
      const {
        Bucket,
        Prefix,
        CopyFrom,
        ResourceId,
      }: {[k: string]: string} = event.ResourceProperties;

      const insert = async () => {
        try {
          const filePaths = await readdirAsync(CopyFrom);

          await Promise.all(filePaths.map(async filePath => {
            const content = await readFileAsync(join(CopyFrom, filePath));
            const fileBaseName = basename(filePath);

            await retryx(() => s3.putObject({
              Bucket,

              Key:         join(Prefix, fileBaseName),
              ContentType: getContentType(fileBaseName),
              Body:        content,
            }).promise());
          }));
        } catch (e) {
          console.log(e);
          throw e;
        }
      };

      const remove = async () => {
        try {
          const listObjectResult = await s3.listObjectsV2({Bucket, Prefix}).promise();

          await s3.deleteObjects({
            Bucket,

            Delete: {
              Objects: (listObjectResult.Contents as S3.Object[]).filter(content => {
                return !(content.Key as string).endsWith('config.json');
              }).map(content => {
                return {Key: content.Key as string};
              }),
            },
          }).promise();
        } catch (e) {
          console.log(e);
          throw e;
        }
      };

      handlers = {
        async onCreate() {
          await insert();

          return {id: ResourceId};
        },

        async onUpdate(updateEvent) {
          await remove();
          await insert();

          return {id: updateEvent.PhysicalResourceId};
        },

        async onDelete(deleteEvent) {
          await remove();

          return {id: deleteEvent.PhysicalResourceId};
        },

      };
    } break;

    case 'Custom::S3Object': {
      const {
        Bucket,
        Key,
        ContentType,
        Body,
      }: {[k: string]: string} = event.ResourceProperties;

      const upsert = async () => {
        try {
          await retryx(() => s3.putObject({
            Bucket,
            Key,
            Body,
            ContentType,
          }).promise());
        } catch (e) {
          console.log(e);
          throw e;
        }
      };

      handlers = {
        async onCreate() {
          await upsert();

          return {id: `s3://${Bucket}/${Key}`};
        },

        async onUpdate(updateEvent) {
          await upsert();

          return {id: updateEvent.PhysicalResourceId};
        },

        async onDelete(deleteEvent) {
          await retryx(() => s3.deleteObject({Bucket, Key}).promise());

          return {id: deleteEvent.PhysicalResourceId};
        },

      };
    } break;

    default: {
      throw new Error('Unknown resource type.');
    }
  }

  return await cfnCustomResource(event, context, handlers);
});

function getContentType(fileName: string): string {
  const contentTypeMap: {[ext: string]: string} = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.txt':  'text/plain',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.ico':  'image/x-icon',
  };

  return contentTypeMap[extname(fileName)];
}
