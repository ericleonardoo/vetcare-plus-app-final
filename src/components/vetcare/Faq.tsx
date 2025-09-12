'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Qual é o horário de funcionamento?',
    answer:
      'Estamos abertos de segunda a sexta, das 9:00 às 17:00, e aos sábados, das 10:00 às 14:00. Fechamos aos domingos.',
  },
  {
    question: 'Preciso de um agendamento para o meu pet?',
    answer:
      'Recomendamos agendar uma consulta para garantir que possamos oferecer o melhor serviço e minimizar seu tempo de espera. Para emergências, ligue diretamente para nós.',
  },
  {
    question: 'Quais tipos de animais vocês atendem?',
    answer:
      'Atendemos principalmente cães e gatos. Para animais exóticos, entre em contato conosco para verificar se um de nossos veterinários pode ajudá-lo.',
  },
  {
    question: 'Quais formas de pagamento vocês aceitam?',
    answer:
      'Aceitamos todos os principais cartões de crédito, dinheiro e pix. O pagamento é devido no momento do atendimento.',
  },
  {
    question: 'O que devo fazer em uma emergência?',
    answer:
      'Se o seu pet estiver em uma emergência durante nosso horário de funcionamento, ligue para nós imediatamente no (11) 98765-4321. Fora do horário comercial, recomendamos entrar em contato com o hospital veterinário de emergência 24 horas mais próximo.',
  },
];

export default function Faq() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Perguntas Frequentes</h2>
            <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                Tem perguntas? Nós temos respostas. Aqui estão algumas coisas comuns que os donos de pets perguntam.
            </p>
        </div>
        <div className="mx-auto max-w-3xl mt-8">
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className='text-lg text-left'>{faq.question}</AccordionTrigger>
                        <AccordionContent className='text-base text-muted-foreground'>
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </div>
    </section>
  );
}
