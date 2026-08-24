import type { Timestamp } from "firebase/firestore";

export type Role = "SUPER_ADMIN" | "LEADER" | "USER";

export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED";

export type ResetRequestStatus = "OPEN" | "RESOLVED";

export type ItemImageCrop = {
  aspect: "square" | "portrait" | "landscape" | "wide";
  zoom: number;
  focusX: number;
  focusY: number;
};

export type AppUserProfile = {
  uid: number;
  username: string;
  usernameLower: string;
  displayName: string;
  role: Role;
  roles?: Role[];
  primaryRole?: Role;
  categoryIds: number[];
  assignedCategoryIds?: number[];
  defaultLeaderCategoryId?: number | null;
  active: boolean;
  is_deleted?: boolean;
  deletedAt?: Timestamp | null;
  deletedById?: number | null;
  deletedByName?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  lastLoginAt?: Timestamp | null;
};

export type UsernameRecord = {
  uid: number;
  username: string;
  usernameLower: string;
  displayName: string;
  role: Role;
  roles?: Role[];
  primaryRole?: Role;
  active: boolean;
  is_deleted?: boolean;
  deletedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type CategoryRecord = {
  id: number;
  name: string;
  description: string;
  active: boolean;
  is_deleted?: boolean;
  deletedAt?: Timestamp | null;
  deletedById?: number | null;
  deletedByName?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type ItemImage = {
  url: string;
  crop?: ItemImageCrop | null;
};

export type ItemRecord = {
  id: number;
  productId?: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  imageUrl?: string | null;
  imagePath?: string | null;
  imageCrop?: ItemImageCrop | null;
  images?: ItemImage[];
  createdById?: number | null;
  createdByName?: string | null;
  createdByRole?: Role | null;
  is_permission?: "YES" | "NO" | string | boolean | null;
  active: boolean;
  is_deleted?: boolean;
  deletedAt?: Timestamp | null;
  deletedById?: number | null;
  deletedByName?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type StockEntryRecord = {
  id: number;
  date: string;
  categoryId: number;
  categoryName: string;
  itemId: number;
  itemName: string;
  qty: number;
  unit?: string | null;
  notes: string;
  createdById: number;
  createdByName: string;
  active?: boolean;
  is_deleted?: boolean;
  deletedAt?: Timestamp | null;
  deletedById?: number | null;
  deletedByName?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type OrderRecord = {
  id: number;
  date: string;
  itemId: number;
  itemName: string;
  categoryId: number;
  categoryName: string;
  qty: number;
  status: OrderStatus;
  summary: string;
  notes: string;
  requestedById: number;
  requestedByName: string;
  requestedByUsername: string;
  decisionById?: number;
  decisionByName?: string;
  decisionNote?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedCustomNote?: string;
  approvedAt?: Timestamp | null;
  rejectedById?: number;
  rejectedByName?: string;
  rejectedCustomNote?: string;
  rejectedAt?: Timestamp | null;
  deliveredById?: number;
  deliveredByName?: string;
  deliveredCustomNote?: string;
  deliveredAt?: Timestamp | null;
  decidedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type ResetRequestRecord = {
  id: number;
  username: string;
  usernameLower: string;
  displayName: string;
  status: ResetRequestStatus;
  temporaryPasswordIssued?: boolean;
  createdAt?: Timestamp | null;
  resolvedAt?: Timestamp | null;
  resolvedById?: number;
  resolvedByName?: string;
};

export type DashboardMetric = {
  label: string;
  value: number;
  status?: OrderStatus;
  accent: "primary" | "accent" | "success" | "danger";
};

export type CreateUserInput = {
  username: string;
  displayName: string;
  password: string;
  role?: Role;
  roles?: Role[];
  primaryRole?: Role;
  categoryIds: number[];
  assignedCategoryIds?: number[];
  defaultLeaderCategoryId?: number | null;
};

export type RequestType = "OUT_OF_STOCK" | "NEW_ITEM";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SpecialRequestRecord = {
  id: number;
  type: RequestType;
  itemId?: number;
  itemName?: string;
  categoryId?: number;
  categoryName?: string;
  newItemName?: string;
  newItemDescription?: string;
  newItemCategoryGuess?: string;
  newItemImageUrl?: string;
  qty: number;
  notes: string;
  status: RequestStatus;
  requestedById: number;
  requestedByName: string;
  requestedByUsername: string;
  decisionById?: number;
  decisionByName?: string;
  decisionNote?: string;
  decidedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  is_deleted?: number;
  deletedAt?: Timestamp | null;
};
