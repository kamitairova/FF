import { useParams } from "react-router-dom";

export default function PublicSeekerProfilePage() {
  const { seekerProfileId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Профиль соискателя #{seekerProfileId}</h1>
        <p className="text-sm text-slate-500">
          Публичная страница профиля.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <p className="text-slate-600">Здесь будут фото, основная информация и публичные резюме автора.</p>
      </div>
    </div>
  );
}