import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Loader2, Bot, User as UserIcon, Phone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const EMERGENCY_NUMBERS = [
  { num: '190', label: 'Polícia', color: 'bg-blue-600' },
  { num: '192', label: 'SAMU', color: 'bg-red-600' },
  { num: '193', label: 'Bombeiros', color: 'bg-orange-600' },
  { num: '180', label: 'Mulher', color: 'bg-pink-600' },
];

export default function AgentChat({ alert, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Inicia conversa
  useEffect(() => {
    let unsubscribe = null;
    (async () => {
      const conv = await base44.agents.createConversation({
        agent_name: 'sentinel_helper',
        metadata: {
          name: alert ? `Alerta ${alert.type}` : 'Conversa SENTINEL',
          description: alert ? `Severidade: ${alert.severity}` : '',
        },
      });
      setConversation(conv);
      setMessages(conv.messages || []);

      // Mensagem inicial contextual
      if (alert) {
        await base44.agents.addMessage(conv, {
          role: 'user',
          content: `Tenho um alerta ATIVO no sistema. Tipo: ${alert.type}. Severidade: ${alert.severity}. ${alert.location_address ? `Localização: ${alert.location_address}.` : ''} Pode me ajudar?`,
        });
      }

      unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
    })().catch(console.error);

    return () => { if (unsubscribe) unsubscribe(); };
  }, [alert]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } finally {
      setSending(false);
    }
  };

  const handleCall = (num) => { window.location.href = `tel:${num}`; };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">SENTINEL Helper</p>
              <p className="text-xs text-blue-100">Apoio em emergência</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Emergency dial bar */}
        <div className="flex gap-2 p-3 bg-red-50 border-b border-red-100 overflow-x-auto">
          {EMERGENCY_NUMBERS.map(e => (
            <button
              key={e.num}
              onClick={() => handleCall(e.num)}
              className={`${e.color} text-white px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold flex-shrink-0 hover:opacity-90 active:scale-95 transition-all`}
            >
              <Phone size={12} />
              {e.num} · {e.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {!conversation && (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-blue-600" />
            </div>
          )}
          {messages.filter(m => m.content).map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div key={i} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={13} className="text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-foreground'
                }`}>
                  {isUser ? (
                    <p className="leading-relaxed">{m.content}</p>
                  ) : (
                    <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon size={13} className="text-gray-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Descreva a situação…"
              disabled={!conversation || sending}
              className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !conversation || sending}
              className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}