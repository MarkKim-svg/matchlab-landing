import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import TodayPreview from "@/components/landing/TodayPreview";
import DashboardSection from "@/components/landing/DashboardSection";
import FomoBanner from "@/components/landing/FomoBanner";
import PlansSection from "@/components/landing/PlansSection";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TodayPreview />
        <DashboardSection />
        <FomoBanner />
        <PlansSection />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
