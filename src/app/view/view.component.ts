import { Component, OnInit } from '@angular/core';
import * as markdownIt from 'markdown-it';

import { S3Service } from '../s3/s3.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  content: string;
  message: string;

  loading = true;
  objectKey = 'CONTENT.md';
  objectType = 'text/markdown';

  constructor(
    private s3: S3Service,
  ) {}

  ngOnInit() {
    this.s3.getObject(this.objectKey).subscribe(
      s3ObjectBody => {
        this.content = markdownIt().render(s3ObjectBody);
        this.loading = false;
      },

      error => {
        this.message = error.message;
        this.loading = false;
      },
    );
  }
}
