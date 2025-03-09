import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  Event as EventI,
  EventService,
} from '../../../../services/event.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Calendar } from 'primeng/calendar';
import { AuthService } from '../../../../services/auth.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  from,
  mergeMap,
  map,
  Observable,
  pairwise,
  scan,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom,
  of,
  finalize,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EventParams } from '../../../../models/event.model';
import { MultiSelect } from 'primeng/multiselect';
import { UserService, User } from '../../../../services/user.service';
import { ParticipantService } from '../../../../services/participant.service';
interface EventResponse {
  events: EventI[];
  totalPages: number;
  currentPage: number;
}

interface Accumulator {
  events: EventI[];
  totalPages: number;
  currentPage: number;
}

@Component({
  selector: 'app-my-events',
  imports: [
    ButtonModule,
    CommonModule,
    RouterModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    Textarea,
    Calendar,
    MultiSelect,
  ],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css',
})
export class MyEventsComponent {
  events$!: Observable<EventI[]>;
  participants = signal<User[]>([]);

  private participantService = inject(ParticipantService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  params$ = new BehaviorSubject<EventParams>({
    limit: 6,
    page: 1,
  });
  // Create a BehaviorSubject to store the accumulated events
  private accumulatedEvents$ = new BehaviorSubject<Accumulator>({
    events: [],
    totalPages: 0,
    currentPage: 0,
  });

  private toastrService = inject(ToastrService);
  private fb = inject(FormBuilder);
  refreshSub$ = new BehaviorSubject<boolean>(false);

  totalPages = signal(0);
  currentPage = signal(0);
  // Reactive form for editing events
  editEventForm: FormGroup;
  participantsForm: FormGroup;
  eventForm: FormGroup;
  pariticipantFormVisible = signal(false);
  selectedParticipants: any[] = [];
  visible: boolean = false;
  users$!: Observable<User[]>;

  constructor() {
    this.editEventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      participants: [[]],
    });

    this.participantsForm = this.fb.group({
      participants: [[]],
    });

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      participants: [[]],
    });

    this.users$ = this.userService
      .getAllUsers()
      .pipe(map((data) => data.users));

    // Fetch all users and filter out participants
  }

  ngOnInit() {
    this.userService
      .getAllUsers()
      .pipe(
        take(1),
        map((data) => data.users),
        shareReplay()
      )
      .subscribe({
        next: (data) => {
          this.participants.set(data);
        },
        error: (error) => {
          this.toastrService.error('Error fetching participants', 'Error');
        },
      });

    this.events$ = combineLatest([this.refreshSub$, this.params$]).pipe(
      debounceTime(300),
      startWith([false, {}] as [boolean, EventParams]),
      pairwise(),
      switchMap(([prev, current]) => {
        const [prevRefresh, prevParams] = prev;
        const [currentRefresh, currentParams] = current;

        const isPageChangeOnly =
          prevParams.page !== currentParams.page &&
          prevParams.limit === currentParams.limit &&
          prevParams.search === currentParams.search &&
          prevParams.location === currentParams.location &&
          prevParams.startDate === currentParams.startDate &&
          prevParams.endDate === currentParams.endDate;

        console.log('Is Page Change Only:', isPageChangeOnly);

        if (isPageChangeOnly) {
          return this.eventService.getUserEvents(currentParams).pipe(
            withLatestFrom(this.accumulatedEvents$),
            scan<[EventResponse, Accumulator], Accumulator>(
              (acc, [eventRes, currentAcc]) => {
                console.log('Accumulator Before:', acc);
                console.log('New Events to Append:', eventRes.events);
                const newAccumulator = {
                  ...eventRes,
                  events: [...currentAcc.events, ...eventRes.events],
                };
                console.log('Accumulator After:', newAccumulator);
                this.accumulatedEvents$.next(newAccumulator);
                return newAccumulator;
              },
              this.accumulatedEvents$.value
            )
          );
        } else {
          return this.eventService.getUserEvents(currentParams).pipe(
            map((eventRes) => ({
              ...eventRes,
              events: eventRes.events,
            })),
            tap((eventRes) => {
              this.accumulatedEvents$.next({
                events: eventRes.events,
                totalPages: eventRes.totalPages,
                currentPage: currentParams.page || 1,
              });
            })
          );
        }
      }),
      tap((eventRes) => {
        console.log('Final Event Response:', eventRes);
        this.totalPages.set(eventRes.totalPages);
      }),
      map((eventRes) => eventRes.events)
    );
  }

  deleteEvent(event: any) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(event._id).subscribe({
        next: () => {
          this.toastrService.success(
            'Event deleted successfully!',
            'Deleted Event'
          );
          this.refreshEvents();
        },

        error: () => {
          this.toastrService.error(
            'Event Failed to delete!',
            'Deletion Failed'
          );
        },
      });
    }
  }

  refreshEvents() {
    this.refreshSub$.next(!this.refreshSub$.value);
  }

  // For editing the event
  editDialogVisible = false;
  editEventData: any = {};

  editEvent(event: any) {
    this.editEventData = { ...event };
    this.editEventForm.patchValue({
      title: event.title,
      description: event.description,
      location: event.location,
      date: new Date(event.date),
    });
    this.editDialogVisible = true;
  }

  onEditEvent() {
    if (this.editEventForm.invalid) {
      this.editEventForm.markAllAsTouched();
      return;
    }

    const updatedEvent = {
      ...this.editEventData,
      ...this.editEventForm.value,
    };

    this.eventService.updateEvent(updatedEvent._id, updatedEvent).subscribe({
      next: () => {
        this.toastrService.success(
          'Event updated successfully!',
          'Updated Event'
        );
        this.editDialogVisible = false;
        this.refreshEvents();
      },

      error: () => {
        this.toastrService.error('Event Failed to Update!', 'Updated Failed');
      },
    });
  }

  logout() {
    this.authService.logout();
  }

  loadMore() {
    if (this.params$.value?.page !== undefined) {
      const nextPage = this.params$.value.page + 1;
      this.params$.next({
        ...this.params$.value,
        page: nextPage,
      });
    }
  }

  // ##################### searching and filtering ofg my everts
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

  selectedEventId = signal('');
  sendInvitations() {
    if (parseInt(this.selectedEventId())) {
      const users = this.participantsForm.get('participants')?.value as User[];

      from(users)
        .pipe(
          mergeMap((user) =>
            this.participantService.sendInvitation(
              this.selectedEventId(),
              user._id
            )
          ),
          catchError((error) => {
            this.toastr.error('Error sending invitation:', error.error.message);
            return of(null);
          }),
          finalize(() => {
            this.pariticipantFormVisible.set(false);
          })
        )
        .subscribe();
    }
  }

  // To create events; ###########
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
