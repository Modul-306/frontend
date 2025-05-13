import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MarkdownModule, MARKED_OPTIONS } from 'ngx-markdown';
import { Blog } from '../../../interfaces/blog';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [MarkdownModule, CommonModule],
  providers: [
    {
      provide: MARKED_OPTIONS,
      useValue: {
        gfm: true,
        breaks: true,
        pedantic: false,
        smartLists: true,
        smartypants: false,
      },
    },
  ],
  templateUrl: './blog-detail.component.html',
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  lineBreak(str: string): string {
    return str.replace(/\n/g, '</br>');
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.apiService.getBlog(id).subscribe({
          next: (blog) => this.blog = blog,
          error: (err) => {
            console.error('Error fetching blog:', err);
            this.error = 'Could not load blog post';
          }
        });
      }
    });
  }
}
