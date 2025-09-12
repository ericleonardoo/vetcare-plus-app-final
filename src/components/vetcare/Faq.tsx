'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What are your hours of operation?',
    answer:
      'We are open Monday to Friday from 9:00 AM to 5:00 PM, and on Saturdays from 10:00 AM to 2:00 PM. We are closed on Sundays.',
  },
  {
    question: 'Do I need an appointment for my pet?',
    answer:
      'We recommend scheduling an appointment to ensure we can provide you with the best service and minimize your wait time. For emergencies, please call us directly.',
  },
  {
    question: 'What types of animals do you treat?',
    answer:
      'We primarily treat dogs and cats. For exotic pets, please contact us to see if one of our veterinarians can assist you.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, cash, and pet insurance. Payment is due at the time of service.',
  },
  {
    question: 'What should I do in an emergency?',
    answer:
      'If your pet is experiencing an emergency during our business hours, please call us immediately at (123) 456-7890. For after-hours emergencies, we recommend contacting the nearest 24/7 emergency veterinary hospital.',
  },
];

export default function Faq() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                Have questions? We've got answers. Here are some common things pet owners ask.
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
