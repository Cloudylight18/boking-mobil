'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, X, Send, Loader2 } from 'lucide-react';

interface HitsbahAIProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface Message {
  sender: 'assistant' | 'user';
  text: string;
}

export default function HitsbahAIModal({ isOpen, onClose, isDarkMode }: HitsbahAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: 'Halo! Saya asisten virtual Hitsbah Transport. Silakan tanyakan apa saja seputar rental mobil, rute, atau berita acara ketentuan sewa!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ref untuk elemen auto-scroll ke bawah
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Otomatis scroll ke bawah setiap ada pesan baru atau status loading berubah
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', { message: userMsg });
      const aiReply = res.data.reply || 'Maaf, layanan Hitsbah Transport sedang mengalami kendala koneksi.';
      setMessages(prev => [...prev, { sender: 'assistant', text: aiReply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Maaf, terjadi kesalahan saat menghubungi server AI Hitsbah Transport.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className={`w-full sm:w-[560px] h-[650px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        
        {/* Header Chat */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base">Tanya Hitsbah Transport</h3>
              <p className="text-xs text-emerald-100">Terhubung ke Database Knowledge & Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-700 rounded-full transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-sm">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-sm ${m.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-2xl rounded-bl-none flex items-center gap-3 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                <Loader2 size={16} className="animate-spin text-emerald-500" />
                <span>Hitsbah Transport sedang mencari informasi...</span>
              </div>
            </div>
          )}
          {/* Invisible element untuk penanda scroll otomatis */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className={`p-4 border-t flex gap-3 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tanya seputar mobil, berita acara, atau syarat sewa..." 
            className={`flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl transition cursor-pointer flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}