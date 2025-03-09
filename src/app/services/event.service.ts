import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
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

  getAllEvents(params: any) {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<EventListResponse>(`${this.apiUrl}/events`, {
      params: httpParams,
    });
  }

  joinEvent(eventId: string) {
    return this.http.post(`${this.apiUrl}/participants/join`, { eventId });
  }

  deleteEvent(eventId: string) {
    return this.http.delete(`${this.apiUrl}/events/${eventId}`);
  }

  createEvent(eventData: any) {
    return this.http.post<EventCreationResponse>(
      `${this.apiUrl}/events`,
      eventData
    );
  }
}
