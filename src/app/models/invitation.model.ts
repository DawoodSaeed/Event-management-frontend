export interface Event {
  _id: string;
  title: string;
  location: string;
  date: string;
}

export interface Invitation {
  _id: string;
  eventId: Event | null;
  userId: string;
  invitationStatus: 'pending' | 'accepted' | 'declined';
  joinedAt: string;
  updatedAt: string;
}
