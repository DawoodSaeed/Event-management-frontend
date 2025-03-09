import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invitation } from '../models/invitation.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyInvitations(): Observable<{ invitations: Invitation[] }> {
    return this.http.get<{ invitations: Invitation[] }>(
      `${this.apiUrl}/participants/my-invitations`
    );
  }

  acceptInvitation(invitationId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/participants/accept-invitation`,
      { invitationId }
    );
  }

  declineInvitation(invitationId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/participants/decline-invitation`,
      { invitationId }
    );
  }

  joinEvent(eventId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/participants/join`,
      { eventId }
    );
  }

  sendInvitation(
    eventId: string,
    userId: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/participants/send-invitation`,
      { eventId, userId }
    );
  }

  getJoinedEvents(): Observable<{ joinedEvents: Invitation[] }> {
    return this.http.get<{ joinedEvents: Invitation[] }>(
      `${this.apiUrl}/participants/joined-events`
    );
  }
}
