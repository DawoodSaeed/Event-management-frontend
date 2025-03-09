import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { EventParams } from '../models/event.model';
export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string; // ISO date string
  createdBy: string;
  status: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface EventListResponse {
  totalPages: number;
  total: number;
  page: number;
  pageSize: number;
  events: Event[];
}

export interface EventCreation {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  createdBy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface EventCreationResponse {
  message: string;
  event: Event;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllEvents(params: EventParams) {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const paramKey = key as keyof EventParams; // Type assertion
      if (params[paramKey]) {
        httpParams = httpParams.set(paramKey, params[paramKey]);
      }
    });

    return this.http.get<EventListResponse>(`${this.apiUrl}/events`, {
      params: httpParams,
    });
  }

  // Fetch only the events created by the logged-in user
  getUserEvents(
    params: EventParams
  ): Observable<{ events: Event[]; totalPages: number; currentPage: number }> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const paramKey = key as keyof EventParams; // Type assertion
      if (params[paramKey]) {
        httpParams = httpParams.set(paramKey, params[paramKey]);
      }
    });

    return this.http.get<{
      events: Event[];
      totalPages: number;
      currentPage: number;
    }>(`${this.apiUrl}/events/my-events`, {
      params: httpParams,
    });
  }

  createEvent(eventData: any) {
    return this.http.post<EventCreationResponse>(
      `${this.apiUrl}/events`,
      eventData
    );
  }

  joinEvent(eventId: string) {
    return this.http.post(`${this.apiUrl}/participants/join`, { eventId });
  }

  // Update an event (only the creator can update it)
  updateEvent(
    eventId: string,
    eventData: Partial<Event>
  ): Observable<{ message: string; event: Event }> {
    return this.http.put<{ message: string; event: Event }>(
      `${this.apiUrl}/events/${eventId}`,
      eventData
    );
  }

  // Delete an event (only the creator can delete it)
  deleteEvent(eventId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/events/${eventId}`
    );
  }

  // Approve an event (admin only)
  approveEvent(eventId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/events/${eventId}/approve`,
      {}
    );
  }
}
