'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-4.82 2.25-3.64 0-6.55-3.05-6.55-6.85s2.91-6.85 6.55-6.85c2.06 0 3.49.83 4.3 1.6l2.43-2.43C18.4 2.1 15.74 1 12.48 1 7.22 1 3.22 4.9 3.22 10s4 9 9.26 9c2.86 0 5.02-1 6.56-2.58 1.6-1.6 2.3-3.9 2.3-6.14 0-.54-.05-1.08-.14-1.6z" />
    </svg>
);

export default function TestLoginPage() {
    const { signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleTestLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle('customer');
            // A lógica de redirecionamento é agora tratada pelo AuthContext
            // após o sucesso da criação do documento.
        } catch (error) {
            console.error("Erro explícito na página de teste:", error);
            toast({
                variant: 'destructive',
                title: "Erro no Login de Teste",
                description: "Algo deu errado. Verifique o console."
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">Página de Teste de Login</h1>
                <p className="text-gray-600 mb-8">
                    Esta página é um ambiente isolado para testar o fluxo de login com Google sem interferências de redirecionamentos ou outras lógicas.
                </p>
                <Button onClick={handleTestLogin} disabled={isLoading} size="lg">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
                    Testar Login com Google
                </Button>
            </div>
        </div>
    );
}
