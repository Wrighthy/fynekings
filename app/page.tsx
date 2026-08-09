"use client";

import { useEffect } from "react";
import CustomCursor from "@/components/ui/CustomCursor";
import Ticker from "@/components/ui/Ticker";
import Toast from "@/components/ui/Toast";
import Nav from "@/components/sections/Nav";
import Cart from "@/components/sections/Cart";
import Hero from "@/components/sections/Hero";
import BrandStrip from "@/components/sections/BrandStrip";
import BestSellers from "@/components/sections/BestSellers";
import Customizer from "@/components/sections/Customizer";
import Countdown from "@/components/sections/Countdown";
import ARTryOn from "@/components/sections/ARTryOn";
import Heritage from "@/components/sections/Heritage";
import Reviews from "@/components/sections/Reviews";
import Education from "@/components/sections/Education";
import Newsletter from "@/components/sections/Newsletter";
import Footer from "@/components/sections/Footer";

export default function Home() {
  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(r => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Ticker />
      <Cart />
      <Nav />
      <Hero />
      <BrandStrip />
      <BestSellers />
      <Customizer />
      <Countdown />
      <ARTryOn />
      <Heritage />
      <Reviews />
      <Education />
      <Newsletter />
      <Footer />
      <Toast />
    </>
  );
}