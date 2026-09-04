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

export interface SubmitterProfile {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: Role | string;
  createdAt?: string;
  preferredLanguage?: LanguageCode;
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
  approvalComment?: string | null;
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
  agent?: SubmitterProfile;
  privateLat?: number;
  privateLng?: number;
  ownerName?: string;
  ownerPhone?: string;
  internalNotes?: string;
  translations?: { languageCode: LanguageCode; title: string; description: string }[];
  attributes?: { key: string; value: string }[] | Record<string, string>;
  media?: { url: string; type?: string; sortOrder?: number }[];
  statusHistory?: StatusHistoryItem[];
  approvalComment?: string | null;
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
  seller?: SubmitterProfile;
  createdAt: string;
  approvalComment?: string | null;
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
  user?: SubmitterProfile;
  createdAt?: string;
  approvalComment?: string | null;
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
  employer?: SubmitterProfile;
  _count?: { applications: number };
  approvalComment?: string | null;
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
  client?: SubmitterProfile;
  assignedAgent?: SubmitterProfile;
}

export interface StatusHistoryItem {
  id: string;
  oldStatus?: string | null;
  newStatus: string;
  comment?: string | null;
  changedAt: string;
  changedBy?: { id: string; name: string; role?: string };
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
