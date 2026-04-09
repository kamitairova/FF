import React from 'react';
import { Link } from 'react-router-dom';

export const ResumeCard = ({ resume }: { resume: any }) => {
  return (
    <div className="surface card-pad shadow-sm" style={{ display: 'grid', gap: 12, borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>
            <Link to={`/resumes/${resume.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {resume.headline || "Специалист"}
            </Link>
          </h3>
          <p style={{ color: '#2563eb', fontWeight: 600 }}>{resume.fullName}</p>
        </div>
        <div className="badge" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>
          {resume.experienceLevel}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, color: '#64748b', fontSize: 14 }}>
        {resume.location && <span>📍 {resume.location}</span>}
        <span>🕒 Обновлено {new Date(resume.updatedAt).toLocaleDateString()}</span>
      </div>

      {resume.skills?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {resume.skills.slice(0, 5).map((skill: string) => (
            <span key={skill} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};