import { TestBed, inject } from '@angular/core/testing';

import { AwsConfigurationService } from './aws-configuration.service';

describe('AwsConfigurationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwsConfigurationService]
    });
  });

  it('should be created', inject([AwsConfigurationService], (service: AwsConfigurationService) => {
    expect(service).toBeTruthy();
  }));
});
