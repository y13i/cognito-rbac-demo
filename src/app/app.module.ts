import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {
  MatButtonModule,
  MatToolbarModule,
  MatTabsModule,
  MatListModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatSnackBarModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressBar,
} from '@angular/material';

import { MatMenu } from '@angular/material/menu/typings/menu-directive';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent, LoginDialogComponent } from './login/login.component';
import { ConfigComponent } from './config/config.component';
import { IdentityComponent } from './identity/identity.component';

import { AwsConfigurationService } from './aws-configuration/aws-configuration.service';
import { CognitoService } from './cognito/cognito.service';
import { LoggerService } from './logger/logger.service';
import { S3Service } from './s3/s3.service';
import { ViewComponent } from './view/view.component';
import { EditComponent } from './edit/edit.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    LoginDialogComponent,
    ConfigComponent,
    IdentityComponent,
    ViewComponent,
    EditComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    HttpClientModule,
    FormsModule,

    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressBarModule,

    AppRoutingModule,
  ],
  providers: [
    AwsConfigurationService,
    CognitoService,
    LoggerService,
    S3Service,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LoginDialogComponent,
  ],
})
export class AppModule { }
