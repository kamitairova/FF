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
  displayName?: string;
  avatarUrl?: string | null;
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

export type ThreadOrigin = "APPLICATION" | "INVITATION" | "DIRECT";

export type ThreadCompanion = {
  type: "company" | "seeker";
  id: number;
  name: string;
  avatarUrl?: string | null;
  subtitle?: string | null;
};

export type ThreadListItem = {
  id: number;
  origin: ThreadOrigin;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  createdByMe: boolean;
  companion: ThreadCompanion;
  vacancy?: {
    id: number;
    title: string;
  } | null;
  resume?: {
    id: number;
    title: string;
  } | null;
  lastMessage?: {
    id: number;
    body: string;
    isSystem?: boolean;
    createdAt: string;
    senderUserId: number;
  } | null;
};

export type ResumePublicDetail = {
  id: number;
  title: string;
  desiredPosition?: string | null;
  salaryExpectation?: number | null;
  experienceLevel?: string | null;
  skills?: string[];
  status?: string;
  updatedAt?: string;
  resumeFile?: {
    id: number;
    fileName: string;
    mimeType?: string;
    url?: string;
  } | null;
  seekerProfile?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    location?: string | null;
    headline?: string | null;
    avatarUrl?: string | null;
  };
};

export type CandidateStage =
  | "UNDER_REVIEW"
  | "INVITED_TO_INTERVIEW"
  | "INTERVIEWED"
  | "HIRED"
  | "REJECTED";

export type MessagingThreadMessage = {
  id: number;
  body: string;
  createdAt: string;
  senderUserId?: number;
  senderUser?: {
    id: number;
    email?: string | null;
  };
};

export type MessagingThread = {
  id: number;
  createdAt?: string;
  updatedAt: string;
  companyEngagedAt?: string | null;
  candidateStage?: CandidateStage | null;
  seekerProfile?: {
    id: number;
    userId?: number;
    firstName?: string | null;
    lastName?: string | null;
    headline?: string | null;
    location?: string | null;
  };
  companyProfile?: {
    id: number;
    userId?: number;
    companyName?: string | null;
    companyCity?: string | null;
    companyCountry?: string | null;
    companyLogoUrl?: string | null;
  };
  vacancy?: {
    id: number;
    title?: string | null;
  } | null;
  messages?: MessagingThreadMessage[];
};