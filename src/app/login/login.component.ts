import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators';

import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MAT_DIALOG_DATA,
} from '@angular/material';

import { CognitoService } from '../cognito/cognito.service';
import { LoggerService } from '../logger/logger.service';

interface LoginInfo {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isSessionValid = false;

  username = '';
  password = '';

  userRole = '';

  constructor(
    private cognito: CognitoService,
    private logger: LoggerService,

    private dialog: MatDialog,
    private snackBar: MatSnackBar,

    private router: Router,
  ) {}

  ngOnInit() {
    this.logger.log('login component init');
    this.ensureUser();
  }

  openDialog() {
    const dialogRef = this.dialog.open<LoginDialogComponent, LoginInfo>(LoginDialogComponent, {
      data: {
        username: this.username,
        password: this.password,
      },
    });

    dialogRef.afterClosed().subscribe((result?: LoginInfo) => {
      if (result) {
        this.cognito.authenticateUser(result.username, result.password).subscribe(
          session => {
            this.snackBar.open(`Logged in as ${result.username}!`, 'Dismiss', {duration: 5000});
            this.ensureUser();
          },

          error => {
            this.snackBar.open(`Error: ${error.message}`, 'Dismiss', {duration: 5000});
          }
        );
      }
    });
  }

  logout() {
    const user = this.cognito.user;

    if (user) {
      user.signOut();
      this.snackBar.open(`Logged out!`, 'Dismiss', {duration: 5000});
      this.isSessionValid = false;
      this.router.navigateByUrl('');
    }
  }

  private ensureUser() {
    this.cognito.getSession().subscribe(
      session => {
        this.isSessionValid = !!(session && session.isValid());

        if (this.isSessionValid) {
          const user = this.cognito.user;

          if (user) {
            this.username = user.getUsername();

            user.getUserAttributes((error, attributes) => {
              if (!error && attributes) {
                const attribute = attributes.find(a => a.getName() === 'custom:role');

                if (attribute) {
                  this.userRole = attribute.getValue();
                }
              }
            });
          }
        }
      },

      error => {
        this.logger.log(error);
      },
    );
  }
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login.dialog.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginDialogComponent {
  hidden = true;

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoginInfo,
  ) {}

  onOkClick(): void {
    this.dialogRef.close(this.data);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
