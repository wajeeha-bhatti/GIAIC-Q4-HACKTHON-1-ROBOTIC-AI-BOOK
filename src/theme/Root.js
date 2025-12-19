import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Chatbot from '../components/Chatbot';

// Wrapper component to handle SSR safely
const ChatbotWrapper = () => {
  return (
    <BrowserOnly fallback={<div>Loading chatbot...</div>}>
      {() => <Chatbot />}
    </BrowserOnly>
  );
};

// Root wrapper component that wraps all Docusaurus pages
const Root = ({ children }) => {
  return (
    <>
      {children}
      <ChatbotWrapper />
    </>
  );
};

export default Root;