import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your AI assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Persist chat state across Docusaurus page navigations
  useEffect(() => {
    const savedState = localStorage.getItem('chatbot-state');
    if (savedState) {
      const { isOpen: savedIsOpen, messages: savedMessages } = JSON.parse(savedState);
      setIsOpen(savedIsOpen);
      setMessages(savedMessages);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbot-state', JSON.stringify({ isOpen, messages }));
  }, [isOpen, messages]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/rag_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || 'Sorry, I couldn\'t process that request.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press (without Shift for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Floating Agent (Closed State) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          right: '30px',
          bottom: '30px',
          zIndex: 99999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0
        }}
        aria-label="Open chatbot"
      >
        <Bot size={24} color="white" />
      </motion.button>

      {/* Chat Window (Open State) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            style={{
              position: 'fixed',
              right: '30px',
              bottom: '30px',
              zIndex: 99999,
              width: '350px',
              height: '500px',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: '16px',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={20} color="white" />
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Robotics Assistant</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.3)'
                }}
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: message.sender === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        backgroundColor: message.sender === 'user'
                          ? '#6366f1'
                          : 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px',
                        wordWrap: 'break-word'
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p {...props} style={{ marginBottom: '8px' }} />,
                          ul: ({node, ...props}) => <ul {...props} style={{ marginBottom: '8px', paddingLeft: '20px' }} />,
                          ol: ({node, ...props}) => <ol {...props} style={{ marginBottom: '8px', paddingLeft: '20px' }} />,
                          li: ({node, ...props}) => <li {...props} style={{ marginBottom: '4px' }} />,
                          strong: ({node, ...props}) => <strong {...props} style={{ fontWeight: 'bold', color: '#a5b4fc' }} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: '18px 18px 18px 4px',
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        color: 'white',
                        fontSize: '14px',
                        wordWrap: 'break-word'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Thinking...</span>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#a5b4fc',
                            borderRadius: '50%',
                            animation: 'bounce 1.5s infinite'
                          }}></div>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#a5b4fc',
                            borderRadius: '50%',
                            animation: 'bounce 1.5s infinite',
                            animationDelay: '0.2s'
                          }}></div>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#a5b4fc',
                            borderRadius: '50%',
                            animation: 'bounce 1.5s infinite',
                            animationDelay: '0.4s'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(15, 23, 42, 0.3)'
                }}
              >
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: 'flex',
                    gap: '8px'
                  }}
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(30, 41, 59, 0.6)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '20px',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isLoading ? (
                      <RotateCcw size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;