import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function useChatAI() {
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const streamChat = async ({
    messages,
    projectContext,
    onDelta,
    onDone,
  }: {
    messages: Message[];
    projectContext?: any;
    onDelta: (deltaText: string) => void;
    onDone: () => void;
  }) => {
    setIsStreaming(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages, projectContext }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: "Límite de tasa excedido",
            description: "Por favor intenta de nuevo en unos momentos.",
            variant: "destructive",
          });
          return;
        }
        if (resp.status === 402) {
          toast({
            title: "Créditos agotados",
            description: "Se han agotado los créditos de AI. Contacta al administrador.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Fallo al iniciar el stream");
      }

      if (!resp.body) {
        throw new Error("No hay cuerpo en la respuesta");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush final
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      onDone();
    } catch (error) {
      console.error("Error en streamChat:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servicio de AI.",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    streamChat,
    isStreaming,
  };
}
