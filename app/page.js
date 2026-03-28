import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import ProReportPreview from "@/components/landing/ProReportPreview";
import Dashboard from "@/components/landing/Dashboard";
import PlansSection from "@/components/landing/PlansSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ml-bg">
        <Hero />
        <ProReportPreview />
        <Dashboard />
        <PlansSection />
        <HowItWorks />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
