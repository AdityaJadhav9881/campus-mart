import { useEffect, useRef } from "react";
import {
  Router,
  Routes,
  useLocation,
} from "./router/router.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Sandbox from "./pages/Sandbox.jsx";
import Download from "./pages/Download.jsx";
import NotFound from "./pages/NotFound.jsx";

const ROUTES = [
  { path: "/", element: <Home /> },
  { path: "/marketplace", element: <Marketplace /> },
  { path: "/how-it-works", element: <HowItWorks /> },
  { path: "/sandbox", element: <Sandbox /> },
  { path: "/download", element: <Download /> },
];

const TITLES = {
  "/": "CampusMart AI — Buy and sell on your own campus",
  "/marketplace": "Live Campus Marketplace — CampusMart AI",
  "/how-it-works": "Four-photo AI verification — CampusMart AI",
  "/sandbox": "Price estimator — CampusMart AI",
  "/download": "Download the Android app — CampusMart AI",
};

function Shell() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    document.title = TITLES[pathname] ?? "Page not found — CampusMart AI";
  }, [pathname]);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-paper"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none pb-16 md:pb-0">
        <Routes routes={ROUTES} notFound={<NotFound />} />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Shell />
    </Router>
  );
}
