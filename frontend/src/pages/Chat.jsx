import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Send, User, MessageSquare, Loader2, AlertCircle } from 'lucide-react'
import { chatService } from '../services/repositoryService'
import styles from './Chat.module.css'

export default function Chat() {
  const { repository } = useOutletContext() || {}
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial welcome message
  useEffect(() => {
    if (repository && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm Codryn, your AI assistant for **${repository.full_name}**. Ask me anything about the codebase.`
        }
      ])
    }
  }, [repository, messages.length])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !repository || loading) return

    const userMessage = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await chatService.chat(repository.id, userMessage.content, sessionId)
      
      if (!sessionId) {
        setSessionId(res.session.id)
      }

      setMessages(res.history.map(msg => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content
      })))

    } catch (err) {
      setError(err.message)
      // Remove the optimistic user message if failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  const formatMessageContent = (content) => {
    // Very basic markdown formatting for display
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />')

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />
  }

  if (!repository) return null

  return (
    <div className={styles.page}>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper}`}>
              <div className={styles.avatar}>
                {msg.role === 'user' ? <User size={16} /> : <MessageSquare size={16} />}
              </div>
              <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                {formatMessageContent(msg.content)}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className={`${styles.messageWrapper} ${styles.assistantWrapper}`}>
              <div className={styles.avatar}>
                <MessageSquare size={16} />
              </div>
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the codebase..."
            disabled={loading}
            className={styles.input}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className={styles.sendBtn}
          >
            {loading ? <Loader2 size={18} className={styles.spin} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}
