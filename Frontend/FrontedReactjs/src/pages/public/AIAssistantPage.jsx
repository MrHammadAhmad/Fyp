import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Trash2, Copy, Sparkles, RefreshCcw } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useAIAssistantStore } from '../../store/aiAssistantStore'
import { aiApi } from '../../api/services/aiApi'
import toast from 'react-hot-toast'

const suggestedPrompts = [
  "Recommend a hairstyle for oval face",
  "Find the best salon for me near downtown",
  "Suggest services for damaged hair",
  "Recommend hydrating skin treatments",
  "Daily hair care tips",
  "Anti-aging skin care tips"
]

export default function AIAssistantPage() {
  const { messages, addMessage, clearMessages } = useAIAssistantStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }

  const handleSend = async (text) => {
    if (!text.trim()) return

    const userMsg = { role: 'user', content: text }
    addMessage(userMsg)
    requestAnimationFrame(scrollToBottom)
    setInput('')
    setIsLoading(true)

    try {
      // Create conversation history for context
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      history.push(userMsg)
      
      const response = await aiApi.chatWithAI({ messages: history })
      addMessage({ role: 'ai', content: response.message || response.reply || 'Sorry, I couldn\'t process that.' })
      requestAnimationFrame(scrollToBottom)
    } catch (error) {
      toast.error('Failed to get AI response. Please try again later.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="container-custom py-24 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#405742] flex items-center justify-center shadow-lg shadow-[#405742]/25">
              <Bot className="text-white" size={24} />
            </div>
            AI Beauty Assistant
          </h1>
          <p className="text-surface-500 mt-2">Your personalized stylist powered by AI.</p>
        </div>
        <Button variant="ghost" onClick={clearMessages} leftIcon={<Trash2 size={16} />} className="text-surface-500 hover:text-red-500">
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-card flex flex-col overflow-hidden">
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#405742]/10 dark:bg-[#405742]/15 flex items-center justify-center mb-6">
                <Sparkles size={40} className="text-[#405742] dark:text-[#5a7a62]" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">How can I help you look your best?</h3>
              <p className="text-surface-500 mb-8">Ask me anything about hairstyles, skincare routines, or let me find the perfect salon for you.</p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedPrompts.map((prompt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="px-4 py-2 bg-surface-100 dark:bg-surface-800 hover:bg-brand-50 dark:hover:bg-surface-700 text-sm font-medium rounded-full transition-colors border border-transparent hover:border-brand-200 dark:hover:border-surface-600 text-surface-700 dark:text-surface-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-surface-200 dark:bg-surface-800' : 'bg-gradient-brand shadow-brand'
                  }`}>
                    {msg.role === 'user' ? <User size={20} className="text-surface-600 dark:text-surface-400" /> : <Bot size={20} className="text-white" />}
                  </div>
                  
                  <div className={`max-w-[75%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white rounded-tr-none' 
                      : 'bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/30 text-surface-900 dark:text-white rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    
                    {msg.role === 'ai' && (
                      <div className="mt-3 flex justify-end">
                        <button onClick={() => handleCopy(msg.content)} className="text-surface-400 hover:text-brand-500 transition-colors p-1" title="Copy response">
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-brand shadow-brand flex items-center justify-center shrink-0">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/30 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 h-12">
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-50 dark:bg-surface-800/50 border-t border-surface-200 dark:border-surface-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-3 bg-white dark:bg-surface-900 rounded-2xl p-2 border border-surface-200 dark:border-surface-700 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-surface-900 dark:text-white placeholder:text-surface-400"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} className="rounded-xl px-4 h-10">
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
