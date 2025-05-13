import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { MarkdownModule } from 'ngx-markdown';
import { Blog } from '../../../interfaces/blog';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MarkdownModule],
  templateUrl: './blog-list.component.html',
  styles: [`
    :host {
      display: block;
      margin: 2rem 0;
    }
  `]
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  isAdmin = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.apiService.getBlogs().subscribe(blogs => {
      this.blogs = blogs;
    });
    this.authService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  getPreview(content: string): string {
    // Get first 150 characters of the markdown content
    return content.slice(0, 150) + '...';
  }

  onDelete(blogId: number): void {
    this.apiService.deleteBlog(blogId.toString()).subscribe(() => {
      this.blogs = this.blogs.filter(blog => blog.ID !== blogId);
    });
  }
}
