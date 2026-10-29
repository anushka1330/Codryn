import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Send, User, MessageSquare, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { chatService } from '../services/repositoryService'
import styles from './Chat.module.css'

export default function Chat() {
  const { repository } = useOutletContext() || {}
  const [messages, setMessages] = useState(() => {
    if (repository?.full_name) {
      return [{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm Codryn, your AI assistant for **${repository.full_name}**. Ask me anything about the codebase.`
      }]
    }
    return []
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFailedMessage, setLastFailedMessage] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    document.title = repository?.name ? `Codryn — ${repository.name} Chat` : 'Codryn — Chat'
  }, [repository])

  // Set initial message when repository loads if empty
  useEffect(() => {
    if (repository?.full_name && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm Codryn, your AI assistant for **${repository.full_name}**. Ask me anything about the codebase.`
        }
      ])
    }
  }, [repository?.full_name, messages.length])

  const submitQuestion = async (questionText) => {
    const text = questionText?.trim()
    if (!text || !repository?.id || loading) return

    const tempUserMessage = { id: `user-${Date.now()}`, role: 'user', content: text }
    setMessages(prev => [...prev, tempUserMessage])
    setInput('')
    setLoading(true)
    setError(null)
    setLastFailedMessage(null)

    try {
      const res = await chatService.chat(repository.id, text, sessionId)

      if (!sessionId && res.session?.id) {
        setSessionId(res.session.id)
      }

      if (res.history?.length) {
        setMessages(res.history.map(msg => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content
        })))
      } else if (res.answer) {
        setMessages(prev => [
          ...prev,
          { id: `assistant-${Date.now()}`, role: 'assistant', content: res.answer }
        ])
      }
    } catch (err) {
      setError(err.message || 'AI generation failed. Please try again.')
      setLastFailedMessage(text)
      // Keep optimistic message so the user can see what they asked
    } finally {
      setLoading(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    submitQuestion(input)
  }

  const handleRetry = () => {
    if (!lastFailedMessage || loading) return
    // Remove the previous optimistic message that failed
    setMessages(prev => prev.filter(m => m.content !== lastFailedMessage || m.id.startsWith('user-') === false))
    submitQuestion(lastFailedMessage)
  }

  const formatMessageContent = (content) => {
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
              {lastFailedMessage && (
                <button 
                  type="button" 
                  onClick={handleRetry} 
                  disabled={loading} 
                  className={styles.retryBtn}
                >
                  <RotateCcw size={12} />
                  Retry
                </button>
              )}
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
