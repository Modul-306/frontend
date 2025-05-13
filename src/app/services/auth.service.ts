import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private currentUser: any,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Only check authentication state in browser
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthentication();
    }
  }

  private checkAuthentication(): void {
    const isAuthenticated = this.checkCookie();
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private checkCookie(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return this.document.cookie.includes('auth=');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  isAuthenticatedStream(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  login(username: string, password: string): Observable<any> {
    return this.apiService.login(username, password).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(true);
        this.currentUser = username;
      })
    );
  }

  register(username: string, password: string, email: string): Observable<any> {
    return this.apiService.register(username, password, email).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(true);
        this.currentUser = username;
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      this.isAuthenticatedSubject.next(false);
      this.currentUser = null;
      this.router.navigate(['/login']);
    }
  }
  

  isAdmin(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId) || !this.isAuthenticated()) {
      return new BehaviorSubject<boolean>(false);
    }

    return this.apiService.getUsers().pipe(
      map(users => {
        const user = users.find(u => u.Name === this.currentUser);
        return user ? user.IsAdmin : false;
      }),
      catchError(err => {
        console.error('Error fetching users:', err);
        return of(false);
      })
    );
  }
}
