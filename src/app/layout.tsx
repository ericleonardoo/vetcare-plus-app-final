
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import Chatbot from '@/components/vetcare/Chatbot';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'VetCare+',
  description: 'Cuidado Excepcional para o Seu Melhor Amigo',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased font-normal">
        <AuthProvider>
          {children}
          <Chatbot />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
