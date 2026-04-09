import { Link } from "react-router-dom";

export default function SeekerResumesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Мои резюме</h1>
          <p className="text-sm text-slate-500">
            Здесь будут отображаться все созданные резюме.
          </p>
        </div>

        <Link
          to="/seeker/resumes/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Создать резюме
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <p className="text-slate-600">Пока страница работает как заглушка. Следующим шагом подключим API и список карточек.</p>
      </div>
    </div>
  );
}