import { TestBed, inject } from '@angular/core/testing';

import { S3Service } from './s3.service';

describe('S3Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [S3Service]
    });
  });

  it('should be created', inject([S3Service], (service: S3Service) => {
    expect(service).toBeTruthy();
  }));
});
