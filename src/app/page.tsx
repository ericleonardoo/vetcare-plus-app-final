import Cta from '@/components/vetcare/Cta';
import Faq from '@/components/vetcare/Faq';
import Footer from '@/components/vetcare/Footer';
import Header from '@/components/vetcare/Header';
import Hero from '@/components/vetcare/Hero';
import Services from '@/components/vetcare/Services';
import { SchedulingCta } from '@/components/vetcare/SchedulingCta';
import Team from '@/components/vetcare/Team';
import Testimonials from '@/components/vetcare/Testimonials';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <div id="servicos">
          <Services />
        </div>
        <div id="equipe">
          <Team />
        </div>
        <div id="depoimentos">
          <Testimonials />
        </div>
        <section id="agendamento" className="w-full py-12 md:py-24 lg:py-32 bg-accent">
            <div className="container px-4 md:px-6">
                <SchedulingCta />
            </div>
        </section>
        <div id="faq">
          <Faq />
        </div>
        <Cta />
      </main>
      <div id="contato">
        <Footer />
      </div>
    </div>
  );
}
