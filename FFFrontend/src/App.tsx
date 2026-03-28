import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { ProtectedRoute, RoleGuard } from "./auth/guards";

import { JobsListPage } from "./pages/public/JobsListPage";
import { JobDetailPage } from "./pages/public/JobDetailPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

import { SeekerProfilePage } from "./pages/seeker/SeekerProfilePage";
import { SeekerResumePage } from "./pages/seeker/SeekerResumePage";
import { SeekerApplicationsPage } from "./pages/seeker/SeekerApplicationsPage";
import { SeekerSavedJobsPage } from "./pages/seeker/SeekerSavedJobsPage";

import { CompanyJobsPage } from "./pages/company/CompanyJobsPage";
import CompanyJobEditorPage from "./pages/company/CompanyJobEditorPage";
import { CompanyApplicantsPage } from "./pages/company/CompanyApplicantsPage";
import { CompanyCandidatesPage } from "./pages/company/CompanyCandidatesPage";
import { CandidateDetailPage } from "./pages/company/CandidateDetailPage";
import CompanyProfilePage from "./pages/company/CompanyProfilePage"
import PublicCompanyProfilePage from "./pages/company/PublicCompanyProfilePage";

import { InboxPage } from "./pages/shared/InboxPage";
import { ThreadPage } from "./pages/shared/ThreadPage";
import { NotificationsPage } from "./pages/shared/NotificationsPage";

import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminJobsModerationPage } from "./pages/admin/AdminJobsModerationPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminTaxonomyPage } from "./pages/admin/AdminTaxonomyPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<JobsListPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:threadId" element={<ThreadPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allow={["USER"]} />}>
            <Route path="/seeker/profile" element={<SeekerProfilePage />} />
            <Route path="/seeker/resume" element={<SeekerResumePage />} />
            <Route path="/seeker/applications" element={<SeekerApplicationsPage />} />
            <Route path="/seeker/saved" element={<SeekerSavedJobsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allow={["COMPANY"]} />}>
            <Route path="/company/jobs" element={<CompanyJobsPage />} />
            <Route path="/company/jobs/new" element={<CompanyJobEditorPage />} />
            <Route path="/company/jobs/:jobId/edit" element={<CompanyJobEditorPage />} />
            <Route path="/company/jobs/:jobId/applicants" element={<CompanyApplicantsPage />} />
            <Route path="/company/candidates" element={<CompanyCandidatesPage />} />
            <Route path="/company/candidates/:seekerProfileId" element={<CandidateDetailPage />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/companies/:id" element={<PublicCompanyProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allow={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/jobs" element={<AdminJobsModerationPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/taxonomy" element={<AdminTaxonomyPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// import React, { useEffect, useState } from 'react';

// function App() {
//   const [health, setHealth] = useState<string>('Loading...');
//   const [jobs, setJobs] = useState<string>('Loading...');
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     // Тест health endpoint
//     fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/health`)      .then(res => res.json())
//       .then(data => setHealth(JSON.stringify(data)))
//       .catch(err => setError(err.message));

//     // Тест jobs endpoint
//     fetch('http://localhost:5000/api/jobs')
//       .then(res => res.json())
//       .then(data => setJobs(JSON.stringify(data)))
//       .catch(err => setError(err.message));
//   }, []);

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Frontend Debug</h1>
//       <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
//         <strong>Health Check:</strong> {health}
//       </div>
//       <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
//         <strong>Jobs:</strong> {jobs}
//       </div>
//       {error && (
//         <div style={{ background: '#ffcccc', padding: '10px', margin: '10px 0', color: 'red' }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;