import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/users/login`, credentials);
  }

  register(userData: { name: string; email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }
}
