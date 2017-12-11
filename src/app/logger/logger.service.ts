import { Injectable, isDevMode } from '@angular/core';

@Injectable()
export class LoggerService {
  private enabled: boolean;

  constructor() {
    this.enabled = isDevMode();
  }

  log(message: any) {
    if (this.enabled) {
      console.log(message);
    }
  }
}
