import React, { useEffect, useState } from "react";
import "../../components/ui.css";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    title: "Fast Find",
    text: "Светлый современный экран входа и регистрации с автослайдом, как в твоём референсе.",
  },
  {
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80",
    title: "Найти работу быстрее",
    text: "Слева навигация и бренд, в центре главный контент, справа профиль и быстрые блоки.",
  },
  {
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    title: "Чистый UI",
    text: "Мягкие карточки, светлая тема, аккуратные формы и более приятный пользовательский путь.",
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
          <div className="auth-feature-list">
            <div className="auth-feature-item"><span className="auth-feature-dot" /> Светлая тема и мягкие карточки</div>
            <div className="auth-feature-item"><span className="auth-feature-dot" /> Автослайд на фоне</div>
            <div className="auth-feature-item"><span className="auth-feature-dot" /> Новый бренд Fast Find / ff</div>
          </div>
        </div>
      </section>

      <section className="card auth-card">
        <div className="auth-card-head">
          <h2>{title}</h2>
          <p>Обновлённый экран под более светлую и аккуратную визуальную систему.</p>
        </div>
        {children}
      </section>
    </div>
  );
}
