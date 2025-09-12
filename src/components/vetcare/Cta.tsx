import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Cta() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Pronto para Dar ao Seu Pet o Melhor Cuidado?</h2>
          <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Não espere. Agende uma consulta hoje e junte-se à família VetCare+. Nossa equipe está pronta para fornecer o cuidado compassivo que seu pet merece.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
            <Button asChild size="lg" variant="secondary" className="w-full">
                <Link href="#agendamento">Agende uma Consulta Agora</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
