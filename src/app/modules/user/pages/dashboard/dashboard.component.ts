import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import {
  EventListResponse,
  EventService,
} from '../../../../services/event.service';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
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
import { DialogModule } from 'primeng/dialog';
import { User, UserService } from '../../../../services/user.service';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface EventParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  startDate?: string; // Format: "YYYY-MM-DD"
  endDate?: string;
}

interface EventI {
  title: string;
  description: string;
  location: string;
  date: string;
  participants: string[]; // Assuming participants are stored as an array of names or IDs
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
    DialogModule,
    CalendarModule,
    MultiSelectModule,
    TextareaModule,
    ReactiveFormsModule,
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
  private toastr = inject(ToastrService);
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

  // Event creation
  eventForm!: FormGroup;
  users$!: Observable<User[]>;
  selectedParticipants: any[] = [];
  visible: boolean = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      participants: [[]],
    });
  }

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

    this.users$ = this.userService
      .getAllUsers()
      .pipe(map((data) => data.users));
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

  logout() {
    this.authService.logout();
  }

  // create event #######################

  // Open the dialog
  showDialog() {
    this.visible = true;
  }

  // Close the dialog
  onDialogHide() {
    this.visible = false;
    this.eventForm.reset(); // Reset the form
  }
  // Reset the form

  // Handle form submission
  onCreateEvent() {
    if (this.eventForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.eventForm.markAllAsTouched();
      return;
    }

    const eventData = {
      ...this.eventForm.value,
      participants: this.eventForm.value.participants.map(
        (user: any) => user._id
      ),
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (eventResponse) => {
        this.toastr.success(
          `Event: ${eventResponse.event.title} is created successfuly`,
          'Event Created'
        );
        this.visible = false; // Close the dialog
        this.eventForm.reset(); // Reset the form
        this.params$.next({});
      },
      error: (err) => {
        this.toastr.error(
          "Event can't be created at the moment.",
          'Event Creation Failed'
        );
      },
    });

    console.log(eventData);
  }
}
