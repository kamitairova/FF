// FFFrontend/src/api/types.ts

export type ApiError = {
  status?: number;
  message: string;
  details?: Record<string, string>;
};

export type UserRole = "JOB_SEEKER" | "COMPANY" | "ADMIN";

export type Me = {
  id: number | string;
  email: string;
  role: UserRole;
  createdAt?: string;
  isDisabled?: boolean;
};

export type VacancyStatus = "PENDING" | "APPROVED" | "REJECTED";

export type JobPost = {
  id: number;
  title: string;
  description: string;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  city?: string | null;
  status: VacancyStatus;
  createdAt?: string;
  updatedAt?: string;
  company?: { id: number; email: string };
};

export type Paged<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type Application = {
  id: string | number;
  status: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    title?: string;
    location?: string;
  };
};

export type Message = {
  id: string | number;
  senderUserId: string | number;
  body: string;
  createdAt: string;
};