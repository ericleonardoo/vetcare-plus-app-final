'use client';

import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const testimonials = [
  {
    name: 'Sarah L.',
    pet: 'Max, Golden Retriever',
    imageId: 'testimonial-1',
    quote: "A equipe da VetCare+ é absolutamente incrível. Eles trataram o Max como se fosse deles. Eu não confiaria em mais ninguém para cuidar da saúde dele.",
  },
  {
    name: 'Mike P.',
    pet: 'Whiskers, Gato Siamês',
    imageId: 'testimonial-2',
    quote: "A Dra. Carter é incrivelmente experiente e compassiva. Ela dedicou tempo para explicar tudo sobre a condição do Whiskers e nos deixou à vontade.",
  },
  {
    name: 'Jessica T.',
    pet: 'Rocky, Bulldog',
    imageId: 'testimonial-3',
    quote: "Tivemos uma emergência e a VetCare+ conseguiu nos atender imediatamente. A ação rápida e o cuidado profissional salvaram a vida do Rocky. Somos eternamente gratos!",
  },
    {
    name: 'Chen W.',
    pet: 'Luna, Gata Vira-lata',
    imageId: 'testimonial-4',
    quote: 'A melhor experiência veterinária que já tive. A equipe da recepção é amigável, a clínica é limpa e o atendimento é de primeira qualidade.',
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">O Que Nossos Clientes Dizem</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Temos orgulho de ter conquistado a confiança da nossa comunidade. Veja o que alguns de nossos clientes têm a dizer sobre sua experiência com a VetCare+.
            </p>
          </div>
        </div>
        <div className="py-12">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => {
                 const testimonialImage = PlaceHolderImages.find((img) => img.id === testimonial.imageId);
                 return (
                <CarouselItem key={testimonial.name} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="h-full flex flex-col justify-between text-center">
                      <CardContent className="flex flex-col items-center gap-4 p-6">
                        {testimonialImage && (
                            <Avatar className='w-24 h-24'>
                                <AvatarImage src={testimonialImage.imageUrl} alt={testimonial.pet} data-ai-hint={testimonialImage.imageHint} />
                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className="flex gap-1 text-primary">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                        </div>
                        <p className="text-base italic text-foreground/80">"{testimonial.quote}"</p>
                        <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.pet}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              )})}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
