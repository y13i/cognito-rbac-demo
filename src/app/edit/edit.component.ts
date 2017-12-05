import { Component, OnInit } from '@angular/core';
import { S3Service } from '../s3/s3.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  content: string;
  message: string;

  loading = true;
  objectKey = 'CONTENT.md';
  objectType = 'text/markdown';

  constructor(
    private s3: S3Service,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.s3.getObject(this.objectKey).subscribe(
      s3ObjectBody => {
        this.content = s3ObjectBody;
        this.loading = false;
      },

      error => {
        this.message = error.message;
        this.loading = false;
      }
    );
  }

  save() {
    this.s3.putObject(this.objectKey, this.content, this.objectType).subscribe(
      () => {
        this.snackBar.open('Saved!', 'Dismiss', {duration: 5000});
      },

      error => {
        this.snackBar.open(`Error: ${error.message}`, 'Dismiss', {duration: 5000});
      },
    );
  }
}
