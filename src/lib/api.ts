const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err.message || res.statusText), { status: res.status, data: err });
  }
  if (res.status === 204) return null as T;
  return res.json();
}

const get = <T>(path: string) => request<T>('GET', path);
const post = <T>(path: string, body: unknown) => request<T>('POST', path, body);
const put = <T>(path: string, body: unknown) => request<T>('PUT', path, body);
const del = (path: string) => request<void>('DELETE', path);

export const api = {
  // Auth
  adminLogin: (mobile: string, password: string) =>
    post<{ id: string; name: string; mobile: string; is_super_admin: boolean }>('/auth/admin-login', { mobile, password }),
  memberLogin: (mobile: string, password: string) =>
    post<{ id: string; name: string; mobile: string }>('/auth/member-login', { mobile, password }),

  // Site stats
  siteStats: () => get<{ activeMembers: number; eventsOrganized: number; yearsOfService: number }>('/site-stats'),

  // Admin stats
  adminStats: () => get<{ members: number; announcements: number; gallery: number; events: number; officeBearers: number; trustCommittee: number }>('/admin/stats'),

  // Members
  getMembers: () => get<any[]>('/members'),
  createMember: (data: any) => post<any>('/members', data),
  updateMember: (id: string, data: any) => put<any>(`/members/${id}`, data),
  deleteMember: (id: string) => del(`/members/${id}`),

  // Announcements
  getAnnouncements: () => get<any[]>('/announcements'),
  createAnnouncement: (data: any) => post<any>('/announcements', data),
  updateAnnouncement: (id: string, data: any) => put<any>(`/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => del(`/announcements/${id}`),

  // Gallery
  getGallery: () => get<any[]>('/gallery'),
  createGallery: (data: any) => post<any>('/gallery', data),
  updateGallery: (id: string, data: any) => put<any>(`/gallery/${id}`, data),
  deleteGallery: (id: string) => del(`/gallery/${id}`),

  // Events
  getEvents: () => get<any[]>('/events'),
  createEvent: (data: any) => post<any>('/events', data),
  updateEvent: (id: string, data: any) => put<any>(`/events/${id}`, data),
  deleteEvent: (id: string) => del(`/events/${id}`),

  // Office Bearers
  getOfficeBearers: () => get<any[]>('/office-bearers'),
  createOfficeBearer: (data: any) => post<any>('/office-bearers', data),
  updateOfficeBearer: (id: string, data: any) => put<any>(`/office-bearers/${id}`, data),
  deleteOfficeBearer: (id: string) => del(`/office-bearers/${id}`),

  // Trust Committee
  getTrustCommittee: () => get<any[]>('/trust-committee'),
  createTrustCommitteeMember: (data: any) => post<any>('/trust-committee', data),
  updateTrustCommitteeMember: (id: string, data: any) => put<any>(`/trust-committee/${id}`, data),
  deleteTrustCommitteeMember: (id: string) => del(`/trust-committee/${id}`),

  // Bookings
  getBookings: () => get<any[]>('/bookings'),
  createBooking: (data: any) => post<any>('/bookings', data),
  updateBooking: (id: string, data: any) => put<any>(`/bookings/${id}`, data),
  deleteBooking: (id: string) => del(`/bookings/${id}`),
};
