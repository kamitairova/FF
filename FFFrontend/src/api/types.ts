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

export type VacancyStatus = "PENDING" | "APPROVED" | "REJECTED" | "REMOVED";
export type EmploymentType = "FULL_TIME" | "PART_TIME";
export type WorkMode = "REMOTE" | "ONSITE" | "HYBRID";
export type ExperienceLevel = "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";

export type SeekerProfile = {
  fullName: string;
  location: string;
  headline: string;
  summary: string;
  skills: string[];
  experienceLevel: ExperienceLevel | "";
};

export type JobPost = {
  id: number;
  title: string;
  description: string;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  city?: string | null;
  category?: string | null;
  employmentType?: EmploymentType | null;
  workMode?: WorkMode | null;
  experienceLevel?: ExperienceLevel | null;
  requiredSkills?: string[];
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
