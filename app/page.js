import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import PreviewSection from "@/components/landing/PreviewSection";
import UserFlow from "@/components/landing/UserFlow";
import RealResults from "@/components/landing/RealResults";
import DashboardSection from "@/components/landing/DashboardSection";
import AIModel from "@/components/landing/AIModel";
import HowItWorks from "@/components/landing/HowItWorks";
import PlansSection from "@/components/landing/PlansSection";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PreviewSection />
        <UserFlow />
        <RealResults />
        <DashboardSection />
        <AIModel />
        <HowItWorks />
        <PlansSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
