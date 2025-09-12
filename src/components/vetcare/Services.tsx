import { Stethoscope, Syringe, HeartPulse, Scissors, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.33 5.5A3.84 3.84 0 0 1 12 4a3.84 3.84 0 0 1 2.67 1.5M15.4 7L18 3" />
    <path d="M17.5 13c-2.5 2.5-5.5 2.5-8 0" />
    <path d="M12 21a9 9 0 0 0 7.5-15.5" />
    <path d="M4.5 5.5A9 9 0 0 0 12 21" />
    <path d="M8.6 7L6 3" />
  </svg>
);

const services = [
  {
    icon: Stethoscope,
    title: 'Routine Check-ups',
    description: 'Regular check-ups to monitor your pet\'s health and catch any issues early.',
  },
  {
    icon: Syringe,
    title: 'Vaccinations',
    description: 'Protect your pet from common diseases with our comprehensive vaccination programs.',
  },
  {
    icon: ToothIcon,
    title: 'Dental Care',
    description: 'Complete dental services, from cleaning to extractions, for a healthy smile.',
  },
  {
    icon: Scissors,
    title: 'Surgery',
    description: 'State-of-the-art surgical procedures performed by our experienced veterinary team.',
  },
  {
    icon: Sparkles,
    title: 'Grooming',
    description: 'Professional grooming services to keep your pet looking and feeling great.',
  },
  {
    icon: HeartPulse,
    title: 'Emergency Visits',
    description: 'Urgent care for unexpected illnesses and injuries during our operating hours.',
  },
];

export default function Services() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Our Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We offer a wide range of services to meet all of your pet's health needs, from routine care to specialized treatments.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="h-full text-center transition-transform transform hover:-translate-y-2 hover:shadow-xl">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <service.icon className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
