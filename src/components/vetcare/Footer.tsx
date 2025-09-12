import Link from 'next/link';
import { Phone, Mail, MapPin, Twitter, Facebook, Instagram, PawPrint } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <PawPrint className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary font-headline">VetCare+</span>
            </Link>
            <p className="text-muted-foreground">
              Oferecendo cuidados veterinários completos e com compaixão para seus amados pets.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-headline">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Rua dos Pets, 123, Cidade Animal, 12345-678</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">(11) 98765-4321</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">contato@vetcareplus.com.br</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-headline">Horários</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Seg - Sex: 9:00 - 17:00</li>
              <li>Sábado: 10:00 - 14:00</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-headline">Siga-nos</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VetCare+. Todos os Direitos Reservados.</p>
        </div>
      </div>
    </footer>
  );
}
