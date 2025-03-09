export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface EventParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  startDate?: string; // Format: "YYYY-MM-DD"
  endDate?: string;
}
