"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'; // For a sleek send icon

// Define message interface for type safety
interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isMarkdown?: boolean;
}

const API_BASE_URL = 'http://127.0.0.1:8000'; // Your FastAPI backend URL

export default function ChatbotDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/rag_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse: Message = { 
        id: Date.now().toString() + '-bot', 
        sender: 'bot', 
        text: data.response,
        isMarkdown: true, 
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        id: Date.now().toString() + '-error', 
        sender: 'bot', 
        text: 'Oops! My AI brain is offline. Please try again later.',
        isMarkdown: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tailwind classes for Glassmorphism effect
  const glassMorphismCard = "bg-white/5 backdrop-filter backdrop-blur-lg border border-white/10 shadow-xl rounded-xl";
  const glassMorphismInput = "bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 shadow-md";

  const chapterLinks = [
    { title: "Chapter 1: Foundations", href: "#chapter-1" },
    { title: "Chapter 2: AI Brains for Robots", href: "#chapter-2" },
    { title: "Chapter 3: RAG System", href: "#chapter-3" },
    { title: "Chapter 4: Frontend Design", href: "#chapter-4" },
    { title: "Chapter 5: Advanced Topics", href: "#chapter-5" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-1/5 p-6 m-4 ${glassMorphismCard} flex flex-col justify-between`}
      >
        <div>
          <h1 className="text-3xl font-extrabold mb-8 text-indigo-400">Robotics AI Chat</h1>
          <nav>
            <ul>
              {chapterLinks.map((link, index) => (
                <motion.li
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (0.05 * index), duration: 0.4 }}
                  className="mb-4"
                >
                  <a
                    href={link.href}
                    className="block p-3 rounded-lg text-lg text-slate-200 hover:bg-white/10 hover:text-indigo-300 transition-all duration-300 transform hover:translate-x-1"
                  >
                    {link.title}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>
        </div>
        <footer className="text-center text-slate-400 text-sm mt-8">
          <p>&copy; 2023 Robotics Book AI</p>
        </footer>
      </motion.aside>

      {/* Chat Interface */}
      <main className="flex-1 flex flex-col p-4 relative">
        {/* Context Awareness Indicator - Floating top right */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`absolute top-6 right-6 p-3 text-sm font-medium ${glassMorphismCard} border-indigo-500/50 text-indigo-300 z-10`}
        >
          <span className="text-indigo-400 animate-pulse mr-2">●</span>Context Aware: Project files scanned.
        </motion.div>

        {/* Chat Window */}
        <div ref={chatContainerRef} className={`flex-1 overflow-y-auto p-6 mb-4 ${glassMorphismCard} scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-slate-700`}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex mb-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-xl relative ${msg.sender === 'user' ? 'bg-indigo-600/80 text-white': `${glassMorphismCard} bg-slate-700/50`}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="absolute -left-3 top-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm shadow-md">AI</div>
                  )}
                  {msg.sender === 'user' && (
                    <div className="absolute -right-3 top-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">You</div>
                  )}
                  {msg.isMarkdown ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      className={`markdown-body ${msg.sender === 'user' ? 'text-white' : 'text-slate-100'}`}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <p className={` ${msg.sender === 'user' ? 'text-white' : 'text-slate-100'}`}>
                      {msg.text}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start mb-6"
              >
                <div className={`max-w-[75%] p-4 rounded-xl relative ${glassMorphismCard} bg-slate-700/50`}>
                  <div className="absolute -left-3 top-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm shadow-md">AI</div>
                  <div className="flex items-center space-x-2">
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                      className="w-2 h-2 bg-indigo-400 rounded-full"
                    ></motion.span>
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      className="w-2 h-2 bg-indigo-400 rounded-full"
                    ></motion.span>
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      className="w-2 h-2 bg-indigo-400 rounded-full"
                    ></motion.span>
                    <p className="italic text-slate-300">AI is typing...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Field and Send Button */}
        <form onSubmit={sendMessage} className="flex gap-4 p-4 rounded-xl bg-white/5 backdrop-filter backdrop-blur-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about robotics, your book, or project files..."
            className={`flex-1 p-4 rounded-lg text-lg ${glassMorphismInput} focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 text-slate-100`}
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              ></motion.div>
            ) : (
              <PaperAirplaneIcon className="h-6 w-6 transform rotate-90" />
            )}
          </motion.button>
        </form>
      </main>
    </div>
  );
}