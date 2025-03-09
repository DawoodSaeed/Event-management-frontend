import { Component, inject, OnInit } from '@angular/core';
import { ParticipantService } from '../../../../services/participant.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Invitation } from '../../../../models/invitation.model';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-invitations',
  templateUrl: './my-invitations.component.html',
  styleUrls: ['./my-invitations.component.css'],
  imports: [ButtonModule, CommonModule, RouterLink],
})
export class MyInvitationsComponent implements OnInit {
  invitations$!: Observable<Invitation[]>;
  joinedEvents$!: Observable<Invitation[]>;
  private authService = inject(AuthService);
  private toastrService = inject(ToastrService);
  refreshInvitations$ = new BehaviorSubject<boolean>(false);
  constructor(private participantService: ParticipantService) {}

  ngOnInit() {
    this.invitations$ = this.refreshInvitations$.pipe(
      switchMap(() =>
        this.participantService
          .getMyInvitations()
          .pipe(
            map((data) =>
              data.invitations.filter(
                (invitation) => invitation.eventId !== null
              )
            )
          )
      )
    );

    this.joinedEvents$ = this.refreshInvitations$.pipe(
      switchMap(() =>
        this.participantService
          .getJoinedEvents()
          .pipe(map((data) => data.joinedEvents))
      )
    );
  }

  refreshInvitations() {
    this.refreshInvitations$.next(!this.refreshInvitations$.value);
  }

  acceptInvitation(invitationId: string) {
    this.participantService.acceptInvitation(invitationId).subscribe({
      next: () => {
        this.toastrService.success('Invitation accepted!');
        this.refreshInvitations();
      },
      error: (error) => {
        this.toastrService.error(
          'Failed to accept invitation: ' + error.message
        );
      },
    });
  }

  declineInvitation(invitationId: string) {
    this.participantService.declineInvitation(invitationId).subscribe({
      next: () => {
        this.toastrService.success('Invitation declined!');
        this.refreshInvitations();
      },
      error: (error) => {
        this.toastrService.error(
          'Failed to decline invitation: ' + error.message
        );
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
