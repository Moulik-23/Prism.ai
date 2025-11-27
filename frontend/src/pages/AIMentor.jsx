import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader, Brain, MessageCircle, Lightbulb, GraduationCap, Target } from 'lucide-react';
import { mentorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const AIMentor = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm Prism AI Mentor, your personal career guidance counselor. I'm here to help you navigate your career journey, answer questions about education, entrance exams, and career opportunities in India. How can I assist you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const heroRef = useScrollAnimation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load chat history and check for career context on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoadingHistory(true);
        const response = await mentorAPI.getChatHistory(currentUser.uid);
        
        // Check for career context from Explore/Detail page
        const careerContext = sessionStorage.getItem('mentorCareerContext');
        let welcomeMessage = "Hello! I'm Prism AI Mentor, your personal career guidance counselor. I remember our previous conversations and your career assessment results. How can I help you today?";
        
        if (careerContext) {
          try {
            const context = JSON.parse(careerContext);
            welcomeMessage = `Hello! I see you're interested in **${context.career_title}**. I have information about this career including its description, salary range, entrance exams, and requirements. Feel free to ask me anything about this career path! How can I help you?`;
            
            // Clear the context after using it (one-time use)
            sessionStorage.removeItem('mentorCareerContext');
          } catch (e) {
            console.error('Error parsing career context:', e);
          }
        }
        
        if (response.history && response.history.length > 0) {
          // Convert chat history to message format
          const historyMessages = response.history.flatMap(chat => [
            { role: 'user', content: chat.message },
            { role: 'assistant', content: chat.response }
          ]);
          
          // Combine with welcome message
          setMessages([
            { 
              role: 'assistant', 
              content: welcomeMessage
            },
            ...historyMessages
          ]);
        } else {
          // No history, just set welcome message
          setMessages([
            { 
              role: 'assistant', 
              content: welcomeMessage
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Keep default welcome message on error
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [currentUser]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check for career context to include in the message
      const careerContext = sessionStorage.getItem('mentorCareerContext');
      let context = null;
      
      if (careerContext) {
        try {
          context = JSON.parse(careerContext);
        } catch (e) {
          console.error('Error parsing career context:', e);
        }
      }
      
      const response = await mentorAPI.sendMessage(currentUser.uid, input, context);
      const aiMessage = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, aiMessage]);
      
      // Clear career context after first message (it's been used)
      if (careerContext) {
        sessionStorage.removeItem('mentorCareerContext');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What are the best engineering branches for the future?",
    "How do I prepare for NEET?",
    "What's the difference between CA and CMA?",
    "Which career is best for creative people?",
    "Tell me about data science careers in India"
  ];

  const handleSuggestionClick = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors pb-6">
      {/* Hero Section */}
      <section className="relative py-8 overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-50"></div>
        <div className="container-custom relative z-10">
          <div ref={heroRef.ref} className={`text-center ${heroRef.isVisible ? 'animate-slide-up' : ''}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-prism-gradient rounded-2xl mb-4 shadow-prism-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              <span className="text-gray-900 dark:text-white">AI Career </span>
              <span className="text-gradient-rainbow">Mentor</span>
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Ask me anything about careers, education, and your future. I'm here to guide you 24/7!
            </p>
          </div>
        </div>
      </section>

      {/* Chat Container */}
      <div className="container-custom mb-6">
        <div 
          className="card-glass overflow-hidden"
          style={{ height: 'calc(100vh - 280px)', minHeight: '550px', maxHeight: '800px' }}
        >
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-prism-gradient">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">Prism AI Mentor</h2>
                  <p className="text-sm text-white/80">Online • Ready to help</p>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/80">Active</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-prism-light/50 to-white dark:from-prism-darker/50 dark:to-prism-darker">
              {loadingHistory && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
                      <Loader className="h-16 w-16 text-prism-violet dark:text-prism-cyan animate-spin relative z-10" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading chat history...</p>
                  </div>
                </div>
              )}
              
              {!loadingHistory && messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-prism ${
                      msg.role === 'user' 
                        ? 'bg-prism-violet dark:bg-prism-cyan' 
                        : 'bg-prism-gradient'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="h-6 w-6 text-white" />
                      ) : (
                        <Bot className="h-6 w-6 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-5 py-3 shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-prism-gradient text-white'
                        : 'bg-white dark:bg-prism-darker text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex justify-start animate-slide-up">
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-prism-gradient flex items-center justify-center shadow-prism">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="bg-white dark:bg-prism-darker rounded-2xl px-5 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-prism-violet dark:bg-prism-cyan rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-prism-indigo dark:bg-prism-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-prism-blue dark:bg-prism-cyan rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {!loadingHistory && messages.length === 1 && (
                <div className="space-y-4 mt-4 animate-scale-in">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-prism-yellow" />
                      Suggested questions to get started:
                    </p>
                  </div>
                  <div className="grid gap-3 max-w-2xl mx-auto">
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(question)}
                        className="text-left p-4 card-3d hover:scale-105 transition-all group cursor-pointer"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors">
                            {question}
                          </span>
                          <MessageCircle className="h-4 w-4 text-prism-violet dark:text-prism-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-prism-darker border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about careers, exams, skills..."
                    className="input-field pr-24 resize-none text-base"
                    rows="2"
                    disabled={loading}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                    Press Enter to send
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${
                    loading || !input.trim()
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                <Sparkles className="h-3 w-3 inline mr-1 text-prism-violet dark:text-prism-cyan" />
                AI-powered responses • Specialized for Indian students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Cards */}
      <div className="container-custom mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card-3d animate-scale-in p-4" style={{ animationDelay: '0s' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-prism-violet to-prism-indigo flex items-center justify-center mb-3 shadow-prism">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">💡 Career Guidance</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Ask about career paths, job roles, and industry insights tailored for the Indian market
            </p>
          </div>
          <div className="card-3d animate-scale-in p-4" style={{ animationDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-prism-indigo to-prism-blue flex items-center justify-center mb-3 shadow-prism">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">📚 Exam Prep</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Get advice on JEE, NEET, CAT, UPSC, and other entrance exams with preparation strategies
            </p>
          </div>
          <div className="card-3d animate-scale-in p-4" style={{ animationDelay: '0.2s' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-prism-blue to-prism-cyan flex items-center justify-center mb-3 shadow-prism">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">🎯 Skill Development</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Learn about skills you need and how to acquire them with personalized learning paths
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;
