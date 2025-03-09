import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import {
  EventListResponse,
  EventService,
} from '../../../../services/event.service';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

interface EventParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  startDate?: string; // Format: "YYYY-MM-DD"
  endDate?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    DropdownModule,
    CommonModule,
    ButtonModule,
    FormsModule,
    TableModule,
    InputTextModule,
  ],
})
export class DashboardComponent implements OnInit {
  events$!: Observable<EventListResponse['events']>;
  currentPage$ = new BehaviorSubject<number>(1);
  params$ = new BehaviorSubject<EventParams>({});
  events: Event[] = [];
  totalPages = signal(0);
  loading = signal(true);
  pageSize: number = 5;
  currentPage = signal(1);

  // Filters
  searchQuery: string = '';
  locationFilter: string = '';
  startDate: string = '';
  endDate: string = '';

  currentUserId: string = '';
  filterOptions = [
    { label: 'All Events', value: 'all' },
    { label: 'My Events', value: 'my' },
    { label: 'Joined Events', value: 'joined' },
    { label: 'Upcoming Events', value: 'upcoming' },
  ];
  selectedFilter = 'all';

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Emit initial params to trigger the first load
    this.params$.next({
      page: this.currentPage$.value,
      limit: this.pageSize,
    });

    this.events$ = this.params$.pipe(
      debounceTime(300),

      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      ),
      tap(() => {
        this.loading.set(true);
      }),
      switchMap((params) => this.eventService.getAllEvents(params)),
      tap((eventsObj) => {
        console.log('Events:', eventsObj);
        this.totalPages.set(eventsObj.totalPages);
      }),
      map((eventsObj) => eventsObj.events),
      tap(() => this.loading.set(false))
    );
  }

  // filterEvents() {
  //   switch (this.selectedFilter) {
  //     case 'my':
  //       this.events = this.events.filter(
  //         (event) => event.creatorId === this.currentUserId
  //       );
  //       break;
  //     case 'joined':
  //       this.events = this.events.filter((event) =>
  //         event.participants.includes(this.currentUserId)
  //       );
  //       break;
  //     case 'upcoming':
  //       this.events = this.events.filter(
  //         (event) => new Date(event.date) > new Date()
  //       );
  //       break;
  //     default:
  //     // this.loadEvents();
  //   }
  // }

  joinEvent(event: any) {
    this.eventService.joinEvent(event._id).subscribe(() => {
      alert('Joined event successfully!');
    });
  }

  viewEvent(event: any) {
    console.log('View event:', event);
  }

  editEvent(event: any) {
    console.log('Edit event:', event);
  }

  deleteEvent(event: any) {
    this.eventService.deleteEvent(event._id).subscribe(() => {
      alert('Event deleted successfully!');
    });
  }

  openCreateEventDialog() {
    console.log('Open event creation dialog');
  }

  filterEvents() {}

  loadEvents() {
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchQuery,
      location: this.locationFilter,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      filter: this.selectedFilter,
    };

    // this.eventService.getAllEvents(params).subscribe(
    //   (response) => {
    //     this.events = response.events;
    //     this.totalRecords = response.total;
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.error('Error loading events:', error);
    //     this.loading = false;
    //   }
    // );
  }

  // Navigate pages
  nextPage() {
    const nextPage = this.currentPage$.value + 1;
    if (nextPage <= this.totalPages()) {
      this.currentPage$.next(nextPage);
      this.params$.next({
        ...this.params$.value,
        page: nextPage,
      });
    }
  }

  prevPage() {
    const prevPage = this.currentPage$.value - 1;
    if (prevPage >= 1) {
      this.currentPage$.next(prevPage);
      this.params$.next({
        ...this.params$.value,
        page: prevPage,
      });
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage$.next(page);
      this.params$.next({
        ...this.params$.value,
        page: page,
      });
    }
  }

  isFirstPage(): boolean {
    return this.currentPage$.value === 1;
  }

  isLastPage(): boolean {
    return this.currentPage$.value === this.totalPages();
  }

  searchTitleOrDescription(event: Event) {
    const target = event.target as HTMLInputElement;
    this.params$.next({
      ...this.params$.value,
      search: target.value,
    });
  }

  searchByLocation(event: Event) {
    const target = event.target as HTMLInputElement;
    this.params$.next({
      ...this.params$.value,
      location: target.value,
    });
  }

  searchByStartDate(event: Event, param: 'startDate' | 'endDate') {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = inputElement.value;

    const formattedDate = this.formatDate(selectedDate);

    console.log(formattedDate == 'NaN-NaN-NaN');

    if (formattedDate == 'NaN-NaN-NaN' && param == 'startDate') {
      const newParams = {
        ...this.params$.value,
      };

      delete newParams.startDate;
      this.params$.next(newParams);
      return;
    }

    if (formattedDate == 'NaN-NaN-NaN' && param == 'endDate') {
      const newParams = {
        ...this.params$.value,
      };

      delete newParams.endDate;
      this.params$.next(newParams);
      return;
    }

    switch (param) {
      case 'startDate':
        this.params$.next({
          ...this.params$.value,
          startDate: formattedDate,
        });
        break;
      case 'endDate':
        this.params$.next({
          ...this.params$.value,
          endDate: formattedDate,
        });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  resetFilters() {
    this.params$.next({});
  }
}
