import { apiFetch } from "./client";
import type { MessagingThread, CandidateStage } from "./types";

import type {
  Application,
  CompanyProfile,
  JobPost,
  Me,
  Message,
  Paged,
  ResumePublicDetail,
  ThreadListItem,
  UserRole,
} from "./types";

export const authApi = {
  register: (body: { email: string; password: string; role?: Exclude<UserRole, "ADMIN"> }) =>
    apiFetch<{ user: Me; token: string }>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<{ user: Me; token: string }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: (token: string) =>
    apiFetch<{ user: Me }>(`/auth/me`, {
      method: "GET",
      token,
    }),

  logout: async (_token: string | null) => ({ ok: true }),
};

export const jobsApi = {
  listPublic: (qs = "") =>
    apiFetch<Paged<JobPost>>(`/jobs${qs}`, { method: "GET" }),

  getPublic: (id: number) =>
    apiFetch<{ job: JobPost }>(`/jobs/${id}`, { method: "GET" }),

  listMyCompany: (token: string) =>
    apiFetch<{ items: JobPost[] }>(`/jobs/my/list`, {
      method: "GET",
      token,
    }),

  getMyCompanyJob: (token: string, id: number) =>
    apiFetch<{ job: JobPost }>(`/jobs/my/${id}`, {
      method: "GET",
      token,
    }),

  createJob: (token: string, body: {
    title: string;
    description: string;
    salaryFrom?: number;
    salaryTo?: number;
    city?: string;
    category?: string;
    employmentType?: "FULL_TIME" | "PART_TIME";
    workMode?: "REMOTE" | "ONSITE" | "HYBRID";
    experienceLevel?: "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
    requiredSkills?: string[];
  }) =>
    apiFetch<{ job: JobPost }>(`/jobs`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  updateJob: (token: string, id: number, body: {
    title?: string;
    description?: string;
    salaryFrom?: number;
    salaryTo?: number;
    city?: string;
    category?: string;
    employmentType?: "FULL_TIME" | "PART_TIME";
    workMode?: "REMOTE" | "ONSITE" | "HYBRID";
    experienceLevel?: "INTERN" | "JUNIOR" | "MIDDLE" | "SENIOR" | "LEAD";
    requiredSkills?: string[];
  }) =>
    apiFetch<{ job: JobPost }>(`/jobs/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    }),

  deleteJob: (token: string, id: number) =>
    apiFetch<void>(`/jobs/${id}`, {
      method: "DELETE",
      token,
    }),
};

export const companiesApi = {
  getById: (id: number | string) =>
    apiFetch<{ company: CompanyProfile }>(`/companies/${id}`),

  getJobs: (id: number | string) =>
    apiFetch<{ items: JobPost[] }>(`/companies/${id}/jobs`),
};

export const adminApi = {
  dashboard: (token: string) =>
    apiFetch(`/admin/metrics`, {
      method: "GET",
      token,
    }),

  users: (token: string, qs = "") =>
    apiFetch(`/admin/users${qs}`, {
      method: "GET",
      token,
    }),

  jobsModeration: (token: string, qs = "") =>
    apiFetch(`/admin/jobs${qs}`, {
      method: "GET",
      token,
    }),

  setJobStatus: (
    token: string,
    jobId: number,
    status: "APPROVED" | "REJECTED" | "REMOVED"
  ) => {
    const action =
      status === "APPROVED"
        ? "approve"
        : status === "REJECTED"
        ? "reject"
        : "remove";

    return apiFetch(`/admin/jobs/${jobId}/${action}`, {
      method: "PATCH",
      token,
    });
  },

  disableUser: (token: string, userId: number) =>
    apiFetch(`/admin/users/${userId}/disable`, {
      method: "PATCH",
      token,
    }),

  enableUser: (token: string, userId: number) =>
    apiFetch(`/admin/users/${userId}/enable`, {
      method: "PATCH",
      token,
    }),

  taxonomy: async (_token: string) => ({ items: [] as any[] }),
};

export const seekerApi = {
  myApplications: async (_token: string, _qs?: string): Promise<Paged<Application>> => ({
    data: [],
    page: 1,
    pageSize: 20,
    total: 0,
  }),

  applications: async (_token: string, _qs?: string): Promise<Paged<Application>> => ({
    data: [],
    page: 1,
    pageSize: 20,
    total: 0,
  }),

  savedJobs: async (_token: string, _qs?: string): Promise<Paged<any>> => ({
    data: [],
    page: 1,
    pageSize: 20,
    total: 0,
  }),

  profile: async (_token: string) => ({ profile: null as any }),
  updateProfile: async (_token: string, _body: any) => ({ ok: true }),
  resume: async (_token: string) => ({ resume: null as any }),
};

export const seekerPhotosApi = {
  list: (token: string) =>
    apiFetch<{ photos: any[] }>(`/seeker/profile/photos`, {
      method: "GET",
      token,
    }),

  upload: (token: string, files: File[]) => {
    const formData = new FormData();

    for (const file of files) {
      formData.append("photos", file);
    }

    return apiFetch<{ photos: any[] }>(`/seeker/profile/photos`, {
      method: "POST",
      token,
      body: formData,
    });
  },

  remove: (token: string, photoId: number) =>
    apiFetch<void>(`/seeker/profile/photos/${photoId}`, {
      method: "DELETE",
      token,
    }),
};

export const publicSeekersApi = {
  getById: (seekerProfileId: number | string) =>
    apiFetch<{ profile: any }>(`/seekers/${seekerProfileId}`, {
      method: "GET",
    }),
};

export const candidatesApi = {
  list: async (_token: string, _qs?: string): Promise<Paged<any>> => ({
    data: [],
    page: 1,
    pageSize: 20,
    total: 0,
  }),
  get: async (_token: string, _id: number | string) => ({ item: null as any }),
};


export const messagingApi = {
  threads: (token: string) =>
    apiFetch<MessagingThread[]>("/messaging/threads", {
      method: "GET",
      token,
    }),

  seekerApplications: (token: string) =>
    apiFetch<MessagingThread[]>("/messaging/seeker/applications", {
      method: "GET",
      token,
    }),

  threadById: (token: string, threadId: number) =>
    apiFetch<MessagingThread>(`/messaging/threads/${threadId}`, {
      method: "GET",
      token,
    }),

  sendMessage: (token: string, threadId: number, body: string) =>
    apiFetch(`/messaging/threads/${threadId}/messages`, {
      method: "POST",
      token,
      body: JSON.stringify({ body }),
      headers: {
        "Content-Type": "application/json",
      },
    }),

  deleteForMe: (token: string, threadId: number) =>
    apiFetch(`/messaging/threads/${threadId}/for-me`, {
      method: "DELETE",
      token,
    }),

  companyCandidates: (token: string) =>
    apiFetch<MessagingThread[]>("/messaging/company/candidates", {
      method: "GET",
      token,
    }),

  updateStage: (token: string, threadId: number, stage: CandidateStage) =>
    apiFetch(`/messaging/company/candidates/${threadId}/stage`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ stage }),
      headers: {
        "Content-Type": "application/json",
      },
    }),

  invite: (
    token: string,
    data: { seekerProfileId: number; vacancyId: number }
  ) =>
    apiFetch<{ id: number }>("/messaging/invite", {
      method: "POST",
      token,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }),

  apply: (token: string, vacancyId: number) =>
    apiFetch<{ id: number }>("/messaging/apply", {
      method: "POST",
      token,
      body: JSON.stringify({ vacancyId }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
};

export const notificationsApi = {
  list: async (_token: string, _qs?: string): Promise<Paged<any>> => ({
    data: [],
    page: 1,
    pageSize: 20,
    total: 0,
  }),
  markRead: async (_token: string, _id: number | string) => ({ ok: true }),
};

export const resumesApi = {
  mine: (token: string) =>
    apiFetch<{ data: any[] }>(`/seeker/resumes`, {
      method: "GET",
      token,
    }),

  byId: (id: string | number, token?: string) =>
    apiFetch<any>(`/resumes/${id}`, {
      method: "GET",
      token,
    }),

  delete: (token: string, id: number) =>
    apiFetch<void>(`/seeker/resumes/${id}`, {
      method: "DELETE",
      token,
    }),
};

