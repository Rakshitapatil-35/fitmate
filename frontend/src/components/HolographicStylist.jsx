import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Minimize2,
  RotateCcw,
  Scissors,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  generateStylistResponse,
  STYLIST_INITIAL_MESSAGE,
  SUGGESTED_PROMPTS,
} from '../services/stylistService.js'
import './HolographicStylist.css'

export default function HolographicStylist({
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
  defaultExpanded = false,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultExpanded)
  const isExpanded = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const toggleOpen = () => {
    if (externalOnToggle) externalOnToggle(!isExpanded)
    else setInternalIsOpen((prev) => !prev)
  }

  // Listen for global open stylist event
  useEffect(() => {
    const handleOpen = () => {
      setInternalIsOpen(true)
      if (externalOnToggle) externalOnToggle(true)
    }
    window.addEventListener('fitmate:open-stylist', handleOpen)
    return () => window.removeEventListener('fitmate:open-stylist', handleOpen)
  }, [externalOnToggle])

  const [messages, setMessages] = useState([STYLIST_INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messageSeqRef = useRef(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isExpanded, isTyping])

  // Focus input on expand
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [isExpanded])

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim()
    if (!text) return

    messageSeqRef.current += 1
    const userMessage = {
      id: `user-msg-${messageSeqRef.current}`,
      sender: 'user',
      text,
      timestamp: 'just now',
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate luxury holographic synthesis latency
    setTimeout(() => {
      messageSeqRef.current += 1
      const response = generateStylistResponse(text)
      const botMessage = {
        id: `stylist-msg-${messageSeqRef.current}`,
        sender: 'stylist',
        text: response.text,
        actionLink: response.actionLink,
        tryOnLink: response.tryOnLink,
        chips: response.chips,
        timestamp: 'just now',
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearHistory = () => {
    setMessages([STYLIST_INITIAL_MESSAGE])
  }

  return (
    <aside
      className={`holographic-stylist-wrapper ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
      aria-label="AURA Holographic AI Personal Stylist"
    >
      {/* 1. COMPACT FLOATING ORB TRIGGER (When Collapsed) */}
      {!isExpanded && (
        <button
          type="button"
          className="stylist-orb-trigger"
          onClick={toggleOpen}
          aria-label="Open AURA Holographic AI Personal Stylist"
          title="Consult AURA AI Personal Stylist"
        >
          {/* Holographic Glowing Rings */}
          <span className="orb-halo-pulse" aria-hidden="true" />
          <span className="orb-specular-ring" aria-hidden="true" />

          {/* Central Monogram / Icon */}
          <div className="orb-core">
            <span className="orb-monogram">AU</span>
            <Sparkles size={11} className="orb-sparkle-badge" />
          </div>

          {/* Floating Pill Label */}
          <div className="orb-label-pill">
            <span className="pill-dot" />
            <span className="pill-text">AI STYLIST</span>
          </div>
        </button>
      )}

      {/* 2. EXPANDED HOLOGRAPHIC CONVERSATION PANEL */}
      {isExpanded && (
        <div className="stylist-panel" role="dialog" aria-modal="true" aria-label="AURA Personal Stylist">
          {/* Specular Edge & Holographic Vignette */}
          <div className="panel-specular-edge" aria-hidden="true" />
          <div className="panel-ambient-aura" aria-hidden="true" />

          {/* Panel Header */}
          <header className="stylist-header">
            <div className="header-identity">
              <div className="stylist-avatar-crest">
                <span className="crest-monogram">AU</span>
                <span className="crest-halo" />
              </div>
              <div className="identity-text">
                <div className="identity-title-row">
                  <strong>AURA</strong>
                  <span className="status-chip">
                    <span className="status-dot" /> HOLOGRAPHIC AI
                  </span>
                </div>
                <small>Bespoke Haute-Couture Stylist & Fit Concierge</small>
              </div>
            </div>

            <div className="header-controls">
              <button
                type="button"
                className="header-ctrl-btn"
                onClick={handleClearHistory}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                className="header-ctrl-btn"
                onClick={toggleOpen}
                title="Minimize Stylist"
                aria-label="Minimize Stylist"
              >
                <Minimize2 size={13} />
              </button>
            </div>
          </header>

          {/* Suggested Quick Prompts Drawer */}
          <div className="stylist-suggestions-row" aria-label="Suggested questions">
            <span className="suggestions-label">SUGGESTIONS</span>
            <div className="suggestions-scroll">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleSendMessage(prompt.query)}
                >
                  <Sparkles size={10} className="chip-icon" />
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Messages Stream */}
          <div className="stylist-messages-stream" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${msg.sender === 'user' ? 'is-user' : 'is-stylist'}`}
              >
                {/* Stylist Header with Badge */}
                {msg.sender === 'stylist' && (
                  <div className="bubble-kicker">
                    <span className="kicker-dot" />
                    <span>AURA FIT INTELLIGENCE</span>
                  </div>
                )}

                {/* Message Prose with formatted Markdown highlights */}
                <div className="bubble-content">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} dangerouslySetInnerHTML={{ __html: formatMessageText(paragraph) }} />
                  ))}
                </div>

                {/* Interactive Action Links inside Stylist Bubble */}
                {(msg.actionLink || msg.tryOnLink) && (
                  <div className="bubble-actions">
                    {msg.actionLink && (
                      <Link to={msg.actionLink.path} className="btn-bubble-action">
                        {msg.actionLink.label} <ArrowUpRight size={12} />
                      </Link>
                    )}
                    {msg.tryOnLink && (
                      <Link to={msg.tryOnLink.path} className="btn-bubble-action btn-try-on">
                        <Scissors size={12} /> {msg.tryOnLink.label}
                      </Link>
                    )}
                  </div>
                )}

                {/* Topic Tags */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="bubble-tags">
                    {msg.chips.map((chip, i) => (
                      <span key={i} className="bubble-tag">#{chip}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Synthesizing / Typing Indicator */}
            {isTyping && (
              <div className="message-bubble is-stylist is-typing-bubble">
                <div className="bubble-kicker">
                  <span className="kicker-dot pulse" />
                  <span>AURA SYNTHESIZING RECOMMENDATION…</span>
                </div>
                <div className="typing-dots">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer & Input Bar */}
          <footer className="stylist-composer">
            <div className="composer-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="composer-input"
                placeholder="Ask AURA to style an occasion, match brands, or analyze your fit…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                aria-label="Message AURA AI Stylist"
              />
              <button
                type="button"
                className="composer-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>

            {/* Honest AI Integration Footnote */}
            <div className="stylist-footnote">
              <ShieldCheck size={11} className="footnote-shield" />
              <span>FITMATE Rule-Based Intelligence · Demonstration Mode · 100% Private</span>
            </div>
          </footer>
        </div>
      )}
    </aside>
  )
}

/**
 * Format markdown bold, bullet points, and italics into clean HTML
 */
function formatMessageText(text) {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/• /g, '•&nbsp;')
  return formatted
}
