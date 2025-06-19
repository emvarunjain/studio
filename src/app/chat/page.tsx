"use client";

import type { FormEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paperclip, Send, User, Bot, Server, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { handleChatMessage } from '@/app/actions/chatActions';
import { useToast } from '@/hooks/use-toast';
import { getConfig } from '@/lib/configClient'; // Client-side config loader

interface Message {
  id: string;
  text: string | React.ReactNode;
  sender: 'user' | 'bot' | 'api';
  timestamp: Date;
  avatar?: string;
  name: string;
}

interface AppConfig {
  appName: string;
  apiEndpoint: string;
  defaultBotMessage: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    async function loadInitialConfig() {
      try {
        const config = await getConfig();
        setAppConfig(config);
        if (config.defaultBotMessage) {
          setMessages([
            {
              id: Date.now().toString(),
              text: config.defaultBotMessage,
              sender: 'bot',
              timestamp: new Date(),
              name: 'Genie Bot',
              avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=Genie`
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load app config:", error);
        toast({ title: "Error", description: "Could not load app configuration.", variant: "destructive" });
      }
    }
    loadInitialConfig();
  }, [toast]);
  

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      name: user.displayName || user.email || 'User',
      avatar: user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.displayName || user.email}`
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await handleChatMessage(input);
      let responseText: string | React.ReactNode = result.message;
      if (result.data) {
        responseText = (
          <div className="space-y-2">
            <p>{result.message}</p>
            <Card className="bg-muted/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium">API Response:</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3">
                <pre className="whitespace-pre-wrap text-xs bg-background p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        );
      }
      
      const apiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: result.data ? 'api' : 'bot',
        timestamp: new Date(),
        name: result.data ? 'API Response' : 'Genie Bot',
        avatar: result.data ? `https://api.dicebear.com/8.x/shapes/svg?seed=API` : `https://api.dicebear.com/8.x/bottts/svg?seed=Genie`
      };
      setMessages(prev => [...prev, apiMessage]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to get response.", variant: "destructive" });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        name: 'Genie Bot',
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=GenieError`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!appConfig) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] max-w-3xl mx-auto bg-card shadow-2xl rounded-lg overflow-hidden">
      <header className="bg-primary text-primary-foreground p-4 border-b border-border">
        <h1 className="text-xl font-headline text-center">{appConfig?.appName || 'Genie Chat'}</h1>
      </header>

      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender !== 'user' && (
              <Avatar className="h-8 w-8 self-start">
                <AvatarImage src={msg.avatar} alt={msg.name} />
                <AvatarFallback>
                  {msg.sender === 'bot' && <Bot className="h-4 w-4" />}
                  {msg.sender === 'api' && <Server className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            )}
            <div className={`max-w-[70%] p-3 rounded-lg shadow ${
              msg.sender === 'user' ? 'bg-accent text-accent-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'
            }`}>
              <p className="text-sm font-medium mb-1">{msg.name}</p>
              <div className="text-sm prose prose-sm max-w-none">{typeof msg.text === 'string' ? msg.text : msg.text}</div>
              <p className="text-xs text-muted-foreground/80 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.sender === 'user' && (
              <Avatar className="h-8 w-8 self-start">
                 <AvatarImage src={msg.avatar} alt={msg.name} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=GenieLoading`} alt="Genie Bot Loading" />
              <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="max-w-[70%] p-3 rounded-lg shadow bg-secondary text-secondary-foreground rounded-bl-none">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background flex items-center space-x-2">
        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow focus-visible:ring-1 focus-visible:ring-accent"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full w-10 h-10" disabled={isLoading || !input.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
