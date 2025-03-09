import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from '../../guards/auth.guard';
import { MyEventsComponent } from './pages/my-events/my-events.component';
import { MyInvitationsComponent } from './pages/my-invitations/my-invitations.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'user' },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { role: 'user' },
  },

  {
    path: 'my-events',
    component: MyEventsComponent,
    canActivate: [AuthGuard],
    data: { role: 'user' },
  },

  {
    path: 'my-invitations',
    component: MyInvitationsComponent,
    canActivate: [AuthGuard],
    data: { role: 'user' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
