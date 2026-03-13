import React, { useEffect, useState } from "react";
import "../../components/ui.css";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    title: "Fast Find",
    text: "Находите вакансии, кандидатов и сообщения в одном аккуратном интерфейсе.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&q=80",
    title: "Работа быстрее",
    text: "Современная подача, чистые формы и удобная навигация без перегруза.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    title: "Профиль и коммуникация",
    text: "После регистрации пользователь сразу получает заметный профиль и понятный маршрут по сервису.",
  },
];

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="container auth-shell">
      <section className="card auth-showcase">
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            className={`auth-slide ${i === index ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className="auth-overlay" />
        <div className="auth-dots">
          {slides.map((_, i) => (
            <span key={i} className={i === index ? "active" : ""} />
          ))}
        </div>
        <div className="auth-copy">
          <h1>{slides[index].title}</h1>
          <p>{slides[index].text}</p>
        </div>
      </section>

      <section className="card auth-card">
        <div className="auth-card-head">
          <h2>{title}</h2>
          <p>Обновлённый экран входа и регистрации с чистым визуалом и более живой подачей.</p>
        </div>
        {children}
      </section>
    </div>
  );
}
