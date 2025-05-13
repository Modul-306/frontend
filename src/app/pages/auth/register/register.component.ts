import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  verifyPassword: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get passwordMismatch(): boolean {
    return this.password !== this.verifyPassword && this.verifyPassword !== '';
  }

  onSubmit() {
    if (!this.username || !this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.authService.register(this.username, this.password, this.email).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    });
  }
}
