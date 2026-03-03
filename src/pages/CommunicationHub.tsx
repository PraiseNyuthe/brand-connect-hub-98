import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navigate, Link } from "react-router-dom";
import { ArrowLeft, Send, LogOut } from "lucide-react";
import { format } from "date-fns";

interface MessageWithManager {
  id: string;
  content: string;
  created_at: string;
  manager_id: string;
  managers: {
    full_name: string;
    brand_name: string;
  };
}

const CommunicationHub = () => {
  const { manager, loading, signOut } = useAuth();
  const [messages, setMessages] = useState<MessageWithManager[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!manager) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, managers(full_name, brand_name)")
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as unknown as MessageWithManager[]);
    };
    fetchMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select("*, managers(full_name, brand_name)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            setMessages((prev) => [...prev, data as unknown as MessageWithManager]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [manager]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !manager || sending) return;
    setSending(true);

    await supabase.from("messages").insert({
      manager_id: manager.id,
      content: newMessage.trim(),
    });

    setNewMessage("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-primary-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!manager) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-brand-navy flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-blue/20 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-primary-foreground/60 hover:text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-lg font-bold text-primary-foreground">Communication Hub</h1>
            <p className="text-xs text-primary-foreground/40">Verified managers only</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/60 hover:bg-brand-blue/20">
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-6 space-y-4 max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center text-primary-foreground/30 py-20">
                <p className="font-display text-lg">No messages yet</p>
                <p className="text-sm">Be the first to start a conversation!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isOwn = msg.manager_id === manager.id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${isOwn ? "bg-brand-blue/30" : "bg-primary-foreground/8"} rounded-2xl px-4 py-3 border ${isOwn ? "border-brand-blue/30" : "border-brand-blue/10"}`}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-brand-blue-light">{msg.managers.full_name}</span>
                        <span className="text-xs text-primary-foreground/30">• {msg.managers.brand_name}</span>
                      </div>
                    )}
                    <p className="text-sm text-primary-foreground">{msg.content}</p>
                    <p className="text-[10px] text-primary-foreground/30 mt-1">
                      {format(new Date(msg.created_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-brand-blue/20 px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="bg-primary-foreground/5 border-brand-blue/20 text-primary-foreground placeholder:text-primary-foreground/30"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-brand-blue hover:bg-brand-blue-light text-primary-foreground shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;
