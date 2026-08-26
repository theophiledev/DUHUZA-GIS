export type Role = 'ADMIN' | 'MANAGER' | 'AGENT' | 'CLIENT';
export type LanguageCode = 'EN' | 'RW' | 'SW';

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
  preferredLanguage: LanguageCode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PublicListing {
  id: string;
  category: string;
  listingType: string;
  price?: number | string | null;
  currency: string;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  publicLat?: number | null;
  publicLng?: number | null;
  createdAt: string;
  title?: string | null;
  description?: string | null;
  isFallbackLanguage?: boolean;
  originalLanguage?: string | null;
  media: { url: string; type: string }[];
  attributes: Record<string, string>;
  whatsappLinkAvailable?: boolean;
}

export interface InternalListing {
  id: string;
  category: string;
  listingType: string;
  price?: number | string | null;
  currency: string;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  publicLat?: number | null;
  publicLng?: number | null;
  createdAt: string;
  status: string;
  agentId: string;
  privateLat?: number;
  privateLng?: number;
  ownerName?: string;
  ownerPhone?: string;
  internalNotes?: string;
  translations?: { languageCode: LanguageCode; title: string; description: string }[];
  attributes?: { key: string; value: string }[] | Record<string, string>;
  media?: { url: string; type?: string; sortOrder?: number }[];
  statusHistory?: StatusHistoryItem[];
}

export interface MarketItem {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number | string;
  currency: string;
  district?: string | null;
  sector?: string | null;
  status: string;
  isPromoted?: boolean;
  media?: { url: string; sortOrder: number }[];
  seller?: { id: string; name: string; phone?: string };
  createdAt: string;
}

export interface ServiceProvider {
  id: string;
  category: string;
  description: string;
  rateInfo?: string | null;
  coverageDistrict?: string | null;
  coverageSector?: string | null;
  status: string;
  isPromoted?: boolean;
  user?: { id: string; name: string };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  salaryRange?: string | null;
  deadline?: string | null;
  status: string;
  createdAt: string;
  employer?: { id: string; name: string };
  _count?: { applications: number };
}

export interface GisRequest {
  id: string;
  parcelLat: number;
  parcelLng: number;
  purpose: string;
  status: string;
  assignedAgentId?: string | null;
  reportUrl?: string | null;
  createdAt: string;
  client?: { id: string; name: string; phone?: string };
  assignedAgent?: { id: string; name: string; phone?: string };
}

export interface StatusHistoryItem {
  id: string;
  oldStatus?: string | null;
  newStatus: string;
  comment?: string | null;
  changedAt: string;
}

export interface UserPermissionItem {
  id: string;
  userId: string;
  permissionKey: string;
  value: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  permissions?: UserPermissionItem[];
}

