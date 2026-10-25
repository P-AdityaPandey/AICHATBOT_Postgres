import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Plus, Send, Sparkles, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen, CircleStop, ChevronDown } from "lucide-react";
import { createSession, deleteSession, getMessages, getSessions, sendMessage } from "./api";

const starterPrompts = [
  { title: "Explain a concept", text: "Explain Spring Boot dependency injection in simple words with a small example." },
  { title: "Write some code", text: "Show me a clean Java 21 example of using records and explain when to use them." },
  { title: "Plan a project", text: "Help me break an AI chatbot project into small development milestones." }
];

function makeId() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; }

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("OPENAI");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeSession = useMemo(() => sessions.find(s => s.id === activeId), [sessions, activeId]);

  async function refreshSessions(preferredId) {
    try {
      const data = await getSessions();
      setSessions(data);
      const nextId = preferredId || activeId || data[0]?.id;
      if (nextId && data.some(s => s.id === nextId)) setActiveId(nextId);
      else if (!data.length) setActiveId(null);
    } catch {
      // A clear API error is shown when the user sends a message.
    }
  }

  useEffect(() => { refreshSessions(); }, []);
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    getMessages(activeId).then(data => { if (!cancelled) setMessages(data); })
      .catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [activeId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function newConversation() {
    setError("");
    try {
      const session = await createSession("New conversation");
      await refreshSessions(session.id);
      setActiveId(session.id);
      setMessages([]);
      inputRef.current?.focus();
    } catch {
      setError("Could not connect to the backend. Start Spring Boot and check VITE_API_BASE_URL.");
    }
  }

  async function chooseSession(id) {
    setActiveId(id);
    setError("");
    try { setMessages(await getMessages(id)); }
    catch { setError("Could not load this conversation."); }
  }

  async function removeSession(event, id) {
    event.stopPropagation();
    try {
      await deleteSession(id);
      const remaining = sessions.filter(s => s.id !== id);
      setSessions(remaining);
      if (activeId === id) {
        setActiveId(remaining[0]?.id || null);
        setMessages([]);
      }
    } catch { setError("Could not delete this conversation."); }
  }

  async function submit(text = input) {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    setError("");
    setBusy(true);
    const optimistic = { id: makeId(), role: "USER", content, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    try {
      let sessionId = activeId;
      if (!sessionId) {
        const session = await createSession(content.slice(0, 42));
        sessionId = session.id;
        setActiveId(sessionId);
      }
      const result = await sendMessage({ sessionId, message: content, provider });
      setMessages(prev => [
        ...prev.filter(m => m.id !== optimistic.id),
        result.userMessage,
        result.assistantMessage
      ]);
      await refreshSessions(sessionId);
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      const message = e?.response?.data?.message || "The request failed. Check your backend and AI provider API key.";
      setError(message);
      setInput(content);
    } finally { setBusy(false); inputRef.current?.focus(); }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><span>nova<span className="brand-light">.ai</span></span>
        <button className="icon-btn collapse-btn" title="Collapse sidebar" onClick={() => setSidebarOpen(false)}><PanelLeftClose size={18}/></button>
      </div>
      <button className="new-chat" onClick={newConversation}><Plus size={17}/> New chat <span>⌘ K</span></button>
      <div className="side-label">YOUR WORKSPACE</div>
      <div className="session-list">
        {sessions.map(s => <button key={s.id} className={`session-item ${activeId === s.id ? "selected" : ""}`} onClick={() => chooseSession(s.id)}>
          <MessageSquare size={16}/><span>{s.title || "New conversation"}</span>
          <span className="delete-session" role="button" title="Delete conversation" onClick={e => removeSession(e, s.id)}><Trash2 size={14}/></span>
        </button>)}
        {!sessions.length && <p className="empty-sessions">Your conversations will appear here.</p>}
      </div>
      <div className="sidebar-bottom"><div className="profile-avatar">A</div><div className="profile-text"><strong>Workspace</strong><span>Personal assistant</span></div><span className="online-dot"/></div>
    </aside>

    <main className="main-panel">
      <header className="topbar">
        <div className="topbar-left">
          {!sidebarOpen && <button className="icon-btn" onClick={() => setSidebarOpen(true)} title="Open sidebar"><PanelLeftOpen size={19}/></button>}
          <div className="model-select-wrap"><span className="model-status"></span><select value={provider} onChange={e => setProvider(e.target.value)} aria-label="AI provider">
            <option value="OPENAI">OpenAI GPT</option><option value="GEMINI">Google Gemini</option>
          </select><ChevronDown size={14} className="select-chevron"/></div>
          <span className="topbar-divider">/</span><span className="current-chat-title">{activeSession?.title || "New conversation"}</span>
        </div>
        <div className="topbar-right"><span className="secure-label"><span className="secure-dot"/> API connected when configured</span></div>
      </header>

      <section className="chat-scroll">
        {messages.length === 0 ? <div className="welcome">
          <div className="welcome-icon"><Sparkles size={25}/></div>
          <div className="eyebrow">YOUR AI WORKSPACE</div>
          <h1>What can I help you<br/><span>figure out today?</span></h1>
          <p className="welcome-subtitle">Think, write, build, and solve problems with your AI assistant.</p>
          <div className="prompt-grid">{starterPrompts.map((p, i) => <button key={p.title} className="prompt-card" onClick={() => submit(p.text)}>
            <span className={`prompt-icon prompt-icon-${i}`}>{i === 0 ? "✳" : i === 1 ? "⌘" : "↗"}</span><strong>{p.title}</strong><span>{p.text}</span>
          </button>)}</div>
        </div> : <div className="message-list">{messages.map((m, i) => <article key={m.id || i} className={`message-row ${m.role === "USER" ? "user-row" : "assistant-row"}`}>
          <div className={`message-avatar ${m.role === "USER" ? "user-avatar" : ""}`}>{m.role === "USER" ? "A" : <Bot size={18}/>}</div>
          <div className="message-body"><div className="message-meta"><strong>{m.role === "USER" ? "You" : "Nova"}</strong><span>{m.role === "USER" ? "You asked" : provider === "GEMINI" ? "Google Gemini" : "OpenAI GPT"}</span></div>
            <div className="message-content">{m.content}</div>
          </div>
        </article>)}
          {busy && <div className="message-row assistant-row"><div className="message-avatar"><Bot size={18}/></div><div className="message-body"><div className="message-meta"><strong>Nova</strong><span>Thinking</span></div><div className="typing"><i/><i/><i/></div></div></div>}
          <div ref={bottomRef}/></div>}
      </section>

      <footer className="composer-area">
        {error && <div className="error-banner">{error}</div>}
        <div className="composer">
          <textarea ref={inputRef} rows="1" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Message Nova..." disabled={busy} aria-label="Message Nova"/>
          <div className="composer-bottom"><div className="composer-hint"><span className="kbd">↵</span> to send <span className="hint-separator">·</span> <span className="kbd">Shift + ↵</span> for new line</div>
            <button className="send-btn" disabled={!input.trim() || busy} onClick={() => submit()} title="Send message">{busy ? <CircleStop size={17}/> : <Send size={17}/>}<span>Send</span></button>
          </div>
        </div>
        <p className="disclaimer">AI can make mistakes. Review important information before relying on it.</p>
      </footer>
    </main>
  </div>;
}