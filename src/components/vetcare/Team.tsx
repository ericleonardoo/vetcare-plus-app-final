import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const teamMembers = [
    {
        imageId: 'vet-1',
        name: 'Dra. Emily Carter',
        role: 'Veterinária Chefe',
        bio: 'Dra. Carter tem mais de 15 anos de experiência e sua paixão é ver um pet sair saudável e feliz.',
    },
    {
        imageId: 'vet-2',
        name: 'Dr. Ben Jacobs',
        role: 'Cirurgião',
        bio: 'Dr. Jacobs une precisão e cuidado em cirurgias avançadas, garantindo a recuperação e o bem-estar do seu pet.',
    },
    {
        imageId: 'vet-3',
        name: 'Maria Garcia',
        role: 'Técnica Veterinária',
        bio: 'Apaixonada por comportamento animal, Maria se dedica a tornar cada visita a mais tranquila e positiva possível.',
    },
    {
        imageId: 'vet-4',
        name: 'David Chen',
        role: 'Assistente de Cuidados',
        bio: 'David é o anjo da guarda dos nossos pacientes, garantindo conforto, carinho e segurança durante a estadia.',
    },
];

export default function Team() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Nossa Equipe de Apaixonados por Pets</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Mais que profissionais, somos pessoas que amam animais. Conheça quem vai tratar seu pet como família.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
                    {teamMembers.map((member) => {
                        const memberImage = PlaceHolderImages.find((img) => img.id === member.imageId);
                        return (
                            <div key={member.name} className="flex flex-col items-center text-center">
                                {memberImage && (
                                    <Avatar className="h-32 w-32 mb-4">
                                        <AvatarImage src={memberImage.imageUrl} alt={member.name} data-ai-hint={memberImage.imageHint} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <h3 className="text-xl font-bold font-headline">{member.name}</h3>
                                <p className="text-sm text-primary">{member.role}</p>
                                <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
