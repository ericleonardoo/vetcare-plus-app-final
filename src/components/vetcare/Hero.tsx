import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh]">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
            />
        )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative container h-full flex flex-col items-center justify-center text-center text-white space-y-6 px-4 md:px-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline">
          Exceptional Care for Your Best Friend
        </h1>
        <p className="max-w-[700px] text-lg md:text-xl">
          At VetCare+, we provide compassionate, state-of-the-art veterinary services to ensure your furry family members live long, healthy, and happy lives.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="#booking">Schedule an Appointment</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
