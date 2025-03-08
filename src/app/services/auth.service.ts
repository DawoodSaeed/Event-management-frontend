import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  token: string;
}

export interface Register {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private userKey = 'authUser';

  private userSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<User>(`${this.apiUrl}/users/login`, credentials);
  }

  register(userData: { name: string; email: string; password: string }) {
    return this.http.post<Register>(`${this.apiUrl}/users/register`, userData);
  }

  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  verifyToken() {
    return this.http.get<{
      user: { _id: string; name: string; email: string; role: string };
    }>(`${this.apiUrl}/users/verify-token`);
  }

  storeUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  loadUserFromStorage() {
    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
