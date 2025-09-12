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

const testimonials = [
  {
    name: 'Sarah L.',
    pet: 'Max, Golden Retriever',
    quote: "The team at VetCare+ is absolutely amazing. They treated Max like he was their own. I wouldn't trust anyone else with his health.",
  },
  {
    name: 'Mike P.',
    pet: 'Whiskers, Siamese Cat',
    quote: "Dr. Carter is incredibly knowledgeable and compassionate. She took the time to explain everything about Whiskers' condition and made us feel at ease.",
  },
  {
    name: 'Jessica T.',
    pet: 'Rocky, Bulldog',
    quote: "We had an emergency and VetCare+ was able to see us right away. Their quick action and professional care saved Rocky's life. We are forever grateful!",
  },
    {
    name: 'Chen W.',
    pet: 'Luna, Domestic Shorthair',
    quote: 'The best vet experience I have ever had. The front desk staff are friendly, the facility is clean, and the care is top-notch.',
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">What Our Clients Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We're proud to have earned the trust of our community. Here's what some of our clients have to say about their experience with VetCare+.
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
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="h-full flex flex-col justify-between">
                      <CardContent className="flex flex-col items-start gap-4 p-6">
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
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
