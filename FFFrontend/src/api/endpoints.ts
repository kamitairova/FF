import { apiFetch } from "./client";
import type { Application, JobPost, Me, Message, Paged, UserRole } from "./types";

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
    apiFetch<{ items: JobPost[] }>(`/jobs/my/list`, { method: "GET", token }),

  createJob: (
    token: string,
    body: {
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
    }
  ) =>
    apiFetch<{ job: JobPost }>(`/jobs`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  updateJob: (token: string, id: number, body: Partial<JobPost>) =>
    apiFetch<{ job: JobPost }>(`/jobs/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    }),

  deleteJob: (token: string, id: number) =>
    apiFetch<void>(`/jobs/${id}`, { method: "DELETE", token }),
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
  threads: async (_token: string, _qs?: string): Promise<Paged<any>> => ({
    data: [],
    page: 1,
    pageSize: 50,
    total: 0,
  }),

  messages: async (_token: string, _threadId: string, _qs?: string): Promise<Paged<Message>> => ({
    data: [],
    page: 1,
    pageSize: 200,
    total: 0,
  }),

  send: async (_token: string, _threadId: string, _body: { body: string }) => ({ ok: true }),
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