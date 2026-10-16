import { Link } from "../router/router.jsx";

export default function Footer() {
  return (
    <footer className="shrink-0 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-5 py-3.5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="text-muted">CampusMart AI</span> · Buy and sell within
          your own campus
        </p>
        <p>
          Engineered by{" "}
          <span className="font-medium text-ink-soft">Aditya Jadhav</span> ·
          Infinity Crew ·{" "}
          <Link to="/how-it-works" className="hover:text-ink">
            How verification works
          </Link>
        </p>
      </div>
    </footer>
  );
}
