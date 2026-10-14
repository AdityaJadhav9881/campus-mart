import { useCallback, useEffect, useState } from "react";
import Navigation from "./sections/Navigation.jsx";
import Hero from "./sections/Hero.jsx";
import Features from "./sections/Features.jsx";
import PriceEstimator from "./sections/PriceEstimator.jsx";
import LiveSandbox from "./sections/LiveSandbox.jsx";
import ArchitectureDiagram from "./sections/ArchitectureDiagram.jsx";
import AppPreview from "./sections/AppPreview.jsx";
import About from "./sections/About.jsx";
import Faq from "./sections/Faq.jsx";
import Footer from "./sections/Footer.jsx";
import WaitlistModal from "./components/WaitlistModal.jsx";

export default function App() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const openWaitlist = useCallback(() => setWaitlistOpen(true), []);
  const closeWaitlist = useCallback(() => setWaitlistOpen(false), []);

  return (
    <div className="min-h-screen bg-void text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-void"
      >
        Skip to content
      </a>

      <Navigation onDownload={openWaitlist} />

      <main id="main">
        <Hero onDownload={openWaitlist} />
        <Features />
        <PriceEstimator />
        <LiveSandbox />
        <ArchitectureDiagram />
        <AppPreview />
        <About />
        <Faq />
      </main>

      <Footer onDownload={openWaitlist} />

      <WaitlistModal open={waitlistOpen} onClose={closeWaitlist} />
    </div>
  );
}
