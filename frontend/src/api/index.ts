import { api, qs } from './client';
import type {
  AdminUser,
  AuthResponse,
  GisRequest,
  InternalListing,
  Job,
  LanguageCode,
  MarketItem,
  PublicListing,
  Role,
  ServiceProvider,
  User,
} from '../types';

// Auth
export const login = (identifier: string, password: string) =>
  api<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }, false);

export const register = (data: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  preferredLanguage?: LanguageCode;
}) => api<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }, false);

export const forgotPassword = (identifier: string) =>
  api<{ message: string; identifier?: string; expiresInMinutes?: number; resetCode?: string }>(
    '/api/auth/forgot-password',
    { method: 'POST', body: JSON.stringify({ identifier }) },
    false
  );

export const verifyResetCode = (identifier: string, code: string) =>
  api<{ valid: boolean; message: string }>(
    '/api/auth/verify-reset-code',
    { method: 'POST', body: JSON.stringify({ identifier, code }) },
    false
  );

export const resetPassword = (identifier: string, code: string, newPassword: string) =>
  api<{ message: string }>(
    '/api/auth/reset-password',
    { method: 'POST', body: JSON.stringify({ identifier, code, newPassword }) },
    false
  );

export const changePassword = (currentPassword: string, newPassword: string) =>
  api<{ message: string }>(
    '/api/auth/change-password',
    { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }
  );

export const getProfile = () =>
  api<{ user: User; counts?: Record<string, number> }>('/api/auth/profile');

export const updateProfile = (data: { name?: string; phone?: string; preferredLanguage?: LanguageCode }) =>
  api<{ user: User; message: string }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Listings (public)
export const searchListings = (params: Record<string, string>, lang: LanguageCode) =>
  api<PublicListing[]>(`/api/listings${qs({ ...params, lang })}`, {}, false);

export const getListing = (id: string, lang: LanguageCode) =>
  api<PublicListing>(`/api/listings/${id}${qs({ lang })}`, {}, false);

export const getListingWhatsapp = (id: string) =>
  api<{ url: string }>(`/api/listings/${id}/whatsapp-link`, {}, false);

// Listings (agent)
export const myListings = () => api<InternalListing[]>('/api/listings/mine/all');

export const createListing = (data: Record<string, unknown>) =>
  api<InternalListing>('/api/listings', { method: 'POST', body: JSON.stringify(data) });

export const updateListing = (id: string, data: Record<string, unknown>) =>
  api<InternalListing>(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const submitListing = (id: string) =>
  api<InternalListing>(`/api/listings/${id}/submit`, { method: 'POST' });

// Market
export const searchMarket = (params: Record<string, string>) =>
  api<MarketItem[]>(`/api/market${qs(params)}`, {}, false);

export const getMarketItem = (id: string) => api<MarketItem>(`/api/market/${id}`, {}, false);

export const getMarketWhatsapp = (id: string) =>
  api<{ url: string }>(`/api/market/${id}/whatsapp-link`, {}, false);

export const myMarketItems = () => api<MarketItem[]>('/api/market/mine/all');

export const createMarketItem = (data: Record<string, unknown>) =>
  api<MarketItem>('/api/market', { method: 'POST', body: JSON.stringify(data) });

// Services
export const searchServices = (params: Record<string, string>) =>
  api<ServiceProvider[]>(`/api/services${qs(params)}`, {}, false);

export const getServiceProvider = (id: string) =>
  api<ServiceProvider>(`/api/services/${id}`, {}, false);

export const getServiceWhatsapp = (id: string) =>
  api<{ url: string }>(`/api/services/${id}/whatsapp-link`, {}, false);

export const myServiceProfile = () => api<ServiceProvider>('/api/services/mine/profile');

export const registerServiceProvider = (data: Record<string, unknown>) =>
  api<ServiceProvider>('/api/services/register', { method: 'POST', body: JSON.stringify(data) });

// Jobs
export const searchJobs = (params: Record<string, string>) =>
  api<Job[]>(`/api/jobs${qs(params)}`, {}, false);

export const getJob = (id: string) => api<Job>(`/api/jobs/${id}`, {}, false);

export const myJobs = () => api<Job[]>('/api/jobs/mine/all');

export const createJob = (data: Record<string, unknown>) =>
  api<Job>('/api/jobs', { method: 'POST', body: JSON.stringify(data) });

export const applyToJob = (id: string, cvUrl?: string) =>
  api<{ id: string }>(`/api/jobs/${id}/apply`, {
    method: 'POST',
    body: JSON.stringify(cvUrl ? { cvUrl } : {}),
  });

export const myApplications = () =>
  api<{ id: string; appliedAt: string; status: string; job: Job }[]>('/api/jobs/applications/mine');

// GIS
export const myGisRequests = () => api<GisRequest[]>('/api/gis/mine/all');

export const createGisRequest = (data: { parcelLat: number; parcelLng: number; purpose: string }) =>
  api<GisRequest>('/api/gis', { method: 'POST', body: JSON.stringify(data) });

export const myAssignedGis = () => api<GisRequest[]>('/api/gis/assigned/all');

export const updateGisProgress = (id: string, data: Record<string, unknown>) =>
  api<GisRequest>(`/api/gis/${id}/progress`, { method: 'PUT', body: JSON.stringify(data) });

// Manager
export const pendingListings = () => api<InternalListing[]>('/api/manager/listings/pending');
export const approveListing = (id: string, comment?: string) =>
  api<InternalListing>(`/api/manager/listings/${id}/approve`, {
    method: 'POST',
    body: comment ? JSON.stringify({ comment }) : undefined,
  });
export const rejectListing = (id: string, comment: string) =>
  api<InternalListing>(`/api/manager/listings/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });

export const pendingMarket = () => api<MarketItem[]>('/api/manager/market/pending');
export const approveMarket = (id: string, comment?: string) =>
  api<MarketItem>(`/api/manager/market/${id}/approve`, {
    method: 'POST',
    body: comment ? JSON.stringify({ comment }) : undefined,
  });
export const rejectMarket = (id: string, comment: string) =>
  api<MarketItem>(`/api/manager/market/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });

export const pendingServices = () =>
  api<(ServiceProvider & { user: { id: string; name: string; phone?: string } })[]>(
    '/api/manager/services/pending'
  );
export const approveService = (id: string, comment?: string) =>
  api<ServiceProvider>(`/api/manager/services/${id}/approve`, {
    method: 'POST',
    body: comment ? JSON.stringify({ comment }) : undefined,
  });
export const rejectService = (id: string, comment: string) =>
  api<ServiceProvider>(`/api/manager/services/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });

export const pendingGis = () => api<GisRequest[]>('/api/manager/gis/pending');
export const assignGis = (id: string, agentId: string) =>
  api<GisRequest>(`/api/manager/gis/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ agentId }),
  });

export const pendingJobs = () =>
  api<(Job & { employer: { id: string; name: string; phone?: string } })[]>('/api/manager/jobs/pending');
export const approveJob = (id: string, comment?: string) =>
  api<Job>(`/api/manager/jobs/${id}/approve`, {
    method: 'POST',
    body: comment ? JSON.stringify({ comment }) : undefined,
  });
export const rejectJob = (id: string, comment: string) =>
  api<Job>(`/api/manager/jobs/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });

// Admin
export const listUsers = () => api<AdminUser[]>('/api/admin/users');

export const createUser = (data: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: Role;
  preferredLanguage?: LanguageCode;
}) => api<AdminUser>('/api/admin/users', { method: 'POST', body: JSON.stringify(data) });

export const setUserStatus = (id: string, isActive: boolean) =>
  api<User>(`/api/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });

export const setUserPermission = (id: string, permissionKey: string, value: string) =>
  api<{ id: string }>(`/api/admin/users/${id}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionKey, value }),
  });
