# JobSearch MVP — Frontend (React + Vite)

Это **только фронтенд** под ТЗ проекта Job Search MVP (RBAC, публичные вакансии, отклики, чат, уведомления, админка).

## Требования
- Node.js 18+

## Быстрый старт
```bash
cd job-search-frontend
npm i
npm run dev
```

По умолчанию фронтенд будет ходить в API по `VITE_API_BASE_URL=/api`.

Создайте `.env` (или используйте `.env.example`):
```bash
cp .env.example .env
```

Если backend запущен на другом хосте/порту — укажите полный URL:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Что реализовано
- Роутинг по страницам из ТЗ: public/seeker/company/admin
- API client под единый формат ошибок + Bearer JWT
- UI в стиле HeadHunter: шапка, фильтры слева, карточки вакансий, аккуратные формы
- Seeker: профиль, structured-resume (JSON), upload resume-file (без download), отклики, избранное
- Company: вакансии CRUD, отклики по вакансии, переходы статусов, поиск кандидатов, карточка кандидата + начать чат
- Shared: inbox (threads/messages), notifications (mark read)
- Admin: metrics, moderation, users enable/disable, categories/tags CRUD

> Важно: download resume-file **не реализован на UI** для не-админов (по правилам ТЗ).

## Тесты
```bash
npm test
```
