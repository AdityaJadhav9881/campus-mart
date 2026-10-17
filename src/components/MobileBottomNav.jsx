import { Home, Sparkles, Store, Megaphone, Smartphone, UserCheck } from "lucide-react";
import { Link, useLocation } from "../router/router.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function MobileBottomNav() {
  const { pathname, search } = useLocation();
  const { signedIn } = useAuth();

  const isHome = pathname === "/";
  const isWanted = pathname === "/marketplace" && (search.includes("wanted") || search.includes("tab=wanted"));
  const isMarket = pathname === "/marketplace" && !isWanted;
  const isSandbox = pathname === "/sandbox";
  const isDownload = pathname === "/download";

  const NAV_ITEMS = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      active: isHome,
    },
    {
      to: "/marketplace",
      label: "Market",
      icon: Store,
      active: isMarket,
    },
    {
      to: "/marketplace?tab=wanted",
      label: "Wanted",
      icon: Megaphone,
      active: isWanted,
      badge: "Cash",
    },
    {
      to: "/sandbox",
      label: "AI Valuer",
      icon: Sparkles,
      active: isSandbox,
    },
    {
      to: "/download",
      label: signedIn ? "Account" : "Get App",
      icon: signedIn ? UserCheck : Smartphone,
      active: isDownload,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-8px_rgba(28,25,23,0.15)]"
    >
      <div className="flex h-15 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex flex-1 flex-col items-center justify-center py-1.5 transition-colors ${
                item.active ? "text-ink" : "text-faint hover:text-ink-soft"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    item.active ? "scale-110 text-accent font-semibold" : ""
                  }`}
                  aria-hidden="true"
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 rounded-full bg-accent px-1 py-0.2 text-[8.5px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-[10.5px] font-medium leading-none tracking-tight ${
                  item.active ? "font-bold text-ink" : "text-muted"
                }`}
              >
                {item.label}
              </span>
              {item.active && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0.5 h-1 w-6 rounded-full bg-accent"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

