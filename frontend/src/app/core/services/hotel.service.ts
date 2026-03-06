import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listRooms(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.base}/rooms`, { params });
  }

  createRoom(payload: any) {
    return this.http.post<any>(`${this.base}/rooms`, payload);
  }

  updateRoom(id: number, payload: any) {
    return this.http.put<any>(`${this.base}/rooms/${id}`, payload);
  }

  deleteRoom(id: number) {
    return this.http.delete<any>(`${this.base}/rooms/${id}`);
  }

  addRoomImageByUrl(id: number, image_url: string) {
    return this.http.post<any>(`${this.base}/rooms/${id}/images`, { image_url });
  }

  addRoomImageFile(id: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.base}/rooms/${id}/images`, formData);
  }

  createBooking(payload: any) {
    return this.http.post(`${this.base}/bookings`, payload);
  }

  roomBookedDates(roomId: number) {
    return this.http.get<any>(`${this.base}/rooms/${roomId}/booked-dates`);
  }

  myBookings() {
    return this.http.get<any>(`${this.base}/bookings/me`);
  }

  cancelBooking(id: number) {
    return this.http.patch(`${this.base}/bookings/${id}/cancel`, {});
  }

  payBooking(id: number) {
    return this.http.post(`${this.base}/bookings/${id}/pay`, {});
  }

  createIssue(payload: { booking_id: number; description: string }) {
    return this.http.post<any>(`${this.base}/bookings/issues`, payload);
  }

  myIssues() {
    return this.http.get<any>(`${this.base}/bookings/issues/me`);
  }

  submitFeedback(payload: { booking_id: number; comment: string; feedback_type?: string }) {
    return this.http.post<any>(`${this.base}/bookings/feedback`, payload);
  }

  myFeedbacks(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.base}/bookings/feedback/me`, { params });
  }

  adminDashboard() {
    return this.http.get<any>(`${this.base}/admin/dashboard`);
  }

  adminBookings() {
    return this.http.get<any>(`${this.base}/admin/bookings`);
  }

  adminReports() {
    return this.http.get<any>(`${this.base}/admin/reports`);
  }

  updateBookingStatus(id: number, status: string) {
    return this.http.patch(`${this.base}/admin/bookings/${id}/status`, { status });
  }

  updateRoomStatus(id: number, status: string) {
    return this.http.patch(`${this.base}/staff/rooms/${id}/status`, { status });
  }

  checkIn(id: number | string) {
    return this.http.patch(`${this.base}/staff/bookings/${id}/check-in`, {});
  }

  checkOut(id: number | string) {
    return this.http.patch(`${this.base}/staff/bookings/${id}/check-out`, {});
  }

  staffBookings(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.base}/staff/bookings`, { params });
  }

  staffRooms(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.base}/staff/rooms`, { params });
  }

  serviceTickets() {
    return this.http.get<any>(`${this.base}/staff/tickets`);
  }

  createTicket(payload: any) {
    return this.http.post(`${this.base}/staff/tickets`, payload);
  }

  updateTicket(id: number, payload: { status?: string; assigned_staff_id?: number }) {
    return this.http.patch(`${this.base}/staff/tickets/${id}`, payload);
  }

  staffFeedbacks(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.base}/staff/feedbacks`, { params });
  }

  adminFeedbacks(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.base}/admin/feedbacks`, { params });
  }

  aiRecommendations(budget?: number) {
    const params = budget ? new HttpParams().set('budget', budget) : undefined;
    return this.http.get<any>(`${this.base}/ai/recommendations`, { params });
  }

  aiStatus() {
    return this.http.get<any>(`${this.base}/ai/status`);
  }

  aiChat(message: string) {
    return this.http.post<any>(`${this.base}/ai/chatbot`, { message });
  }

  aiRevenuePrediction() {
    return this.http.get<any>(`${this.base}/ai/revenue-prediction`);
  }
}
