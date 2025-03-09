import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Event, EventService } from '../../../../services/event.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Message, MessageModule } from 'primeng/message';
import { AuthService } from '../../../../services/auth.service';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [ConfirmationService, MessageService],
  imports: [
    ButtonModule,
    InputTextModule,
    Textarea,
    DialogModule,
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ConfirmDialogModule,
    MessageModule,
  ],
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  events: Event[] = [];
  loading = false;
  editDialogVisible = false;
  selectedEvent: Event | null = null;
  eventForm!: FormGroup;
  deleteDialogVisible = false;
  constructor(
    private eventService: EventService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadPendingEvents();

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  loadPendingEvents() {
    this.loading = true;
    this.eventService.getPendingEventsForAdmin().subscribe((data) => {
      this.events = data.events;
      this.loading = false;
    });
  }

  approveEvent(eventId: string, event: Event) {
    event.approving = true;
    this.eventService.approveEventForAdmin(eventId).subscribe(
      (next) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Event Approved!',
        });
        event.approving = false;
        this.loadPendingEvents();
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve event: ' + error.message,
        });
        event.approving = false;
      }
    );
  }

  openEditDialog(event: Event) {
    this.selectedEvent = event;

    const formattedDate = new Date(event.date).toISOString().split('T')[0];

    this.eventForm.patchValue({
      ...event,
      date: formattedDate,
    });

    this.editDialogVisible = true;
  }

  saveEventChanges() {
    if (!this.selectedEvent) return;

    this.eventService
      .editEventForAdmin(this.selectedEvent._id, this.eventForm.value)
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Event Updated!',
        });
        this.editDialogVisible = false;
        this.loadPendingEvents();
      });
  }

  confirmDelete(eventId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this event?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventService.deleteEventForAdmin(eventId).subscribe(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Deleted',
            detail: 'Event Deleted!',
          });
          this.loadPendingEvents();
        });
      },
      reject: () => {
        this.deleteDialogVisible = false;
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
