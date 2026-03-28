import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { JobPost } from "../api/types";
import "./ui.css";

type Props = {
  job: JobPost;
};

export function JobCard({ job }: Props) {
  const navigate = useNavigate();

  const companyName =
    job.companyProfile?.companyName ||
    job.companyProfile?.user?.email ||
    "Компания";

  const companyId = job.companyProfile?.id;

  return (
    <div
      className="surface card-pad"
      style={{ cursor: "pointer", display: "grid", gap: 10 }}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <div style={{ fontSize: 20, fontWeight: 800 }}>{job.title}</div>

      <div>
        {companyId ? (
          <Link
            to={`/companies/${companyId}`}
            onClick={(e) => e.stopPropagation()}
          >
            {companyName}
          </Link>
        ) : (
          <span>{companyName}</span>
        )}
      </div>

      <div>{job.city}</div>
      <div>{job.description?.slice(0, 120)}...</div>
    </div>
  );
}