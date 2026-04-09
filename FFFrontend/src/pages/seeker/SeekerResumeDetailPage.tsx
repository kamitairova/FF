import { useParams } from "react-router-dom";

export default function SeekerResumeDetailPage() {
  const { resumeId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Моё резюме #{resumeId}</h1>
        <p className="text-sm text-slate-500">
          Здесь будет детальная страница резюме.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <p className="text-slate-600">Детали резюме подключим после API-слоя.</p>
      </div>
    </div>
  );
}