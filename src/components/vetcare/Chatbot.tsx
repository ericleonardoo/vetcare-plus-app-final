'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { chat } from '@/lib/actions';
import {
  Loader2,
  MessageSquare,
  Send,
  X,
  Bot,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  
  const chatbotAvatar = PlaceHolderImages.find((img) => img.id === 'chatbot-avatar');

  const scrollToBottom = () => {
    if (scrollAreaViewportRef.current) {
        setTimeout(() => {
            if (scrollAreaViewportRef.current) {
                scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
            }
        }, 100);
    }
  };

  useEffect(() => {
    if (isOpen) {
        if(messages.length === 0) {
            setMessages([
                { role: 'model', content: 'Olá! Sou o Dr. Gato, seu assistente virtual da VetCare+. Como posso ajudar hoje?' }
            ]);
        }
    }
  }, [isOpen, messages.length]);
  
  useEffect(() => {
    if(isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);


  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    startTransition(async () => {
      try {
        const response = await chat({ history: newMessages });
        setMessages((prev) => [...prev, { role: 'model', content: response }]);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no Chat',
          description: 'Não foi possível obter uma resposta. Tente novamente.',
        });
      }
    });
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
          <span className="sr-only">Abrir Chat</span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50">
          <Card className="w-80 md:w-96 h-[60vh] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center gap-3 p-4 bg-primary text-primary-foreground">
              <Avatar>
                {chatbotAvatar && <AvatarImage src={chatbotAvatar.imageUrl} alt="Dr. Gato" />}
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Dr. Gato</p>
                <p className="text-xs text-primary-foreground/80">Assistente Virtual</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
              <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                <div className="space-y-4 p-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-2 text-sm',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'model' && (
                        <Avatar className="w-6 h-6">
                            {chatbotAvatar && <AvatarImage src={chatbotAvatar.imageUrl} />}
                           <AvatarFallback><Bot className='h-4 w-4'/></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.content}
                      </div>
                       {message.role === 'user' && (
                        <Avatar className="w-6 h-6">
                           <AvatarFallback><User className='h-4 w-4'/></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                   {isPending && (
                        <div className="flex gap-2 text-sm justify-start">
                             <Avatar className="w-6 h-6">
                                {chatbotAvatar && <AvatarImage src={chatbotAvatar.imageUrl} />}
                                <AvatarFallback><Bot className='h-4 w-4'/></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Digitando...</span>
                            </div>
                        </div>
                    )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isPending}
                />
                <Button type="submit" size="icon" onClick={handleSendMessage} disabled={isPending || !input.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
