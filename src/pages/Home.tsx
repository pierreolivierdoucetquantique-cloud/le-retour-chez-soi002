import Layout from "../components/Layout";
import Hero from "../components/Hero";
import MissionTeaser from "../components/MissionTeaser";
import SectionDivider from "../components/SectionDivider";
import ServicesPreview from "../components/ServicesPreview";
import TestimonialsPreview from "../components/TestimonialsPreview";
import UpcomingEvents from "../components/UpcomingEvents";
import LatestArticles from "../components/LatestArticles";
import Newsletter from "../components/Newsletter";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <MissionTeaser />
      <SectionDivider />
      <ServicesPreview />
      <TestimonialsPreview />
      <UpcomingEvents />
      <LatestArticles />
      <SectionDivider flip />
      <Newsletter />
    </Layout>
  );
}
