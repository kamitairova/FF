import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import RoleGuard from "./auth/RoleGuard";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

import { JobsListPage } from "./pages/public/JobsListPage";
import { JobDetailPage } from "./pages/public/JobDetailPage";
import { ResumesListPage } from "./pages/public/ResumesListPage";
import PublicResumeDetailPage from "./pages/public/PublicResumeDetailPage";
import PublicSeekerProfilePage from "./pages/public/PublicSeekerProfilePage";

import CompanyProfilePage from "./pages/company/CompanyProfilePage";
import { CompanyJobsPage } from "./pages/company/CompanyJobsPage";
import CompanyJobEditorPage from "./pages/company/CompanyJobEditorPage";
import { CompanyApplicantsPage } from "./pages/company/CompanyApplicantsPage";
import { CompanyCandidatesPage } from "./pages/company/CompanyCandidatesPage";
import { CandidateDetailPage } from "./pages/company/CandidateDetailPage";

import { SeekerProfilePage } from "./pages/seeker/SeekerProfilePage";
import SeekerResumesPage from "./pages/seeker/SeekerResumePage";
import SeekerResumeEditorPage from "./pages/seeker/SeekerResumeEditorPage";
import SeekerResumeDetailPage from "./pages/seeker/SeekerResumeDetailPage";
import { SeekerApplicationsPage } from "./pages/seeker/SeekerApplicationsPage";
import { SeekerSavedJobsPage } from "./pages/seeker/SeekerSavedJobsPage";

import { InboxPage } from "./pages/shared/InboxPage";
import { NotificationsPage } from "./pages/shared/NotificationsPage";

import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
// import AdminJobsPage from "./pages/admin/AdminJobsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminTaxonomyPage } from "./pages/admin/AdminTaxonomyPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<JobsListPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/resumes" element={<ResumesListPage />} />
        <Route path="/resumes/:resumeId" element={<PublicResumeDetailPage />} />
        <Route path="/seekers/:seekerProfileId" element={<PublicSeekerProfilePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/seeker/profile"
          element={
            <RoleGuard allow={["USER"]}>
              <SeekerProfilePage />
            </RoleGuard>
          }
        />
        <Route
          path="/seeker/resumes"
          element={
            <RoleGuard allow={["USER"]}>
              <SeekerResumesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/seeker/resumes/new"
          element={
            <RoleGuard allow={["USER"]}>
              <SeekerResumeEditorPage />
            </RoleGuard>
          }
        />
        <Route
          path="/seeker/resumes/:resumeId"
          element={
            <RoleGuard allow={["USER"]}>
              <SeekerResumeDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="/seeker/resumes/:resumeId/edit"
          element={
            <RoleGuard allow={["USER"]}>
              <SeekerResumeEditorPage />
            </RoleGuard>
          }
        />
        <Route
          path="/seeker/applications"
          element={
            <RoleGuard allow={["USER"]}>
              <SeekerApplicationsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/seeker/saved"
          element={
            <RoleGuard allow={["USER"]}>
              <SeekerSavedJobsPage />
            </RoleGuard>
          }
        />

        <Route
          path="/company/profile"
          element={
            <RoleGuard allow={["COMPANY"]}>
              <CompanyProfilePage />
            </RoleGuard>
          }
        />
        <Route
          path="/company/jobs"
          element={
            <RoleGuard allow={["COMPANY"]}>
              <CompanyJobsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/company/jobs/new"
          element={
            <RoleGuard allow={["COMPANY"]}>
              <CompanyJobEditorPage />
            </RoleGuard>
          }
        />
        <Route
          path="/company/jobs/:jobId/edit"
          element={
            <RoleGuard allow={["COMPANY"]}>
              <CompanyJobEditorPage />
            </RoleGuard>
          }
        />
        <Route
          path="/company/jobs/:jobId/applicants"
          element={
            <RoleGuard allow={["COMPANY"]}>
              <CompanyApplicantsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/company/candidates"
          element={
            <RoleGuard allow={["COMPANY"]}>
              <CompanyCandidatesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/company/candidates/:seekerProfileId"
          element={
            <RoleGuard allow={["COMPANY"]}>
              <CandidateDetailPage />
            </RoleGuard>
          }
        />

        <Route
          path="/inbox"
          element={
            <RoleGuard allow={["USER", "COMPANY", "ADMIN"]}>
              <InboxPage />
            </RoleGuard>
          }
        />
        <Route
          path="/notifications"
          element={
            <RoleGuard allow={["USER", "COMPANY", "ADMIN"]}>
              <NotificationsPage />
            </RoleGuard>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleGuard allow={["ADMIN"]}>
              <AdminDashboardPage />
            </RoleGuard>
          }
        />
        {/* <Route
          path="/admin/jobs"
          element={
            <RoleGuard allow={["ADMIN"]}>
              <AdminJobsPage />
            </RoleGuard>
          }
        /> */}
        <Route
          path="/admin/users"
          element={
            <RoleGuard allow={["ADMIN"]}>
              <AdminUsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/taxonomy"
          element={
            <RoleGuard allow={["ADMIN"]}>
              <AdminTaxonomyPage />
            </RoleGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}