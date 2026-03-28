export type ApiError = {
  status?: number;
  message: string;
  details?: Record<string, string>;
};

export type UserRole = "USER" | "COMPANY" | "ADMIN";

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

// export type JobPost = {
//   id: number;
//   title: string;
//   description: string;
//   salaryFrom?: number | null;
//   salaryTo?: number | null;
//   city?: string | null;
//   category?: string | null;
//   employmentType?: EmploymentType | null;
//   workMode?: WorkMode | null;
//   experienceLevel?: ExperienceLevel | null;
//   requiredSkills?: string[];
//   status: VacancyStatus;
//   wasPublishedBefore?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
//   companyId?: number;
//   company?: { id: number; email: string };
// };

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

export type CompanyProfile = {
  id: number;
  userId?: number;
  companyName?: string;
  companyLogoUrl?: string | null;
  companyShortDescription?: string | null;
  companyDescription?: string | null;
  companyWebsite?: string | null;
  companyPhone?: string | null;
  companyCity?: string | null;
  companyCountry?: string | null;
  email?: string;
  user?: {
    id: number;
    email: string;
  };
  photos?: CompanyPhoto[];
  createdAt?: string;
  updatedAt?: string;
};

export type CompanyPhoto = {
  id: number;
  imageUrl: string;
  sortOrder: number;
  createdAt?: string;
};

export type JobPost = {
  id: number;
  title: string;
  description: string;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  city?: string | null;
  category?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  experienceLevel?: string | null;
  requiredSkills: string[];
  status?: string;
  wasPublishedBefore?: boolean;
  createdAt: string;
  updatedAt?: string;
  companyProfileId?: number;
  companyProfile?: {
    id: number;
    companyName?: string | null;
    companyLogoUrl?: string | null;
    companyCity?: string | null;
    companyCountry?: string | null;
    user?: {
      id: number;
      email: string;
    };
  };
};