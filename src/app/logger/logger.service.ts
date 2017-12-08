import { Injectable, isDevMode } from '@angular/core';

@Injectable()
export class LoggerService {
  constructor(
    private enabled: boolean,
  ) {
    this.enabled = isDevMode();
  }

  log(message: any) {
    if (this.enabled) {
      console.log(message);
    }
  }
}
