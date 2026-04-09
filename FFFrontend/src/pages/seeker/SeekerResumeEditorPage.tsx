import { useParams } from "react-router-dom";

export default function SeekerResumeEditorPage() {
  const { resumeId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {resumeId ? "Редактирование резюме" : "Создание резюме"}
        </h1>
        <p className="text-sm text-slate-500">
          Здесь будет форма резюме и загрузка PDF.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <p className="text-slate-600">Форма будет добавлена следующим шагом.</p>
      </div>
    </div>
  );
}