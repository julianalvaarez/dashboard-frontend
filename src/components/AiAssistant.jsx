import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { ContextApp } from "../context/ContextApp";

const SUGGESTED_QUESTIONS = [
    "¿Cuál es el balance general de todos los jugadores?",
    "¿Quién tuvo más ingresos este mes?",
    "Mostrame el resumen de gastos de marzo",
    "¿Cuánto se gastó en total el último mes?",
];

function formatTime(date) {
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────
function MessageBubble({ message }) {
    const isUser = message.role === "user";
    const isError = message.isError;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: "8px",
                marginBottom: "16px",
            }}
        >
            {/* Avatar */}
            <div
                style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    background: isUser
                        ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                        : isError
                            ? "#fee2e2"
                            : "linear-gradient(135deg, #16a34a, #15803d)",
                }}
            >
                {isUser ? "👤" : isError ? "⚠️" : "🤖"}
            </div>

            {/* Burbuja */}
            <div
                style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isUser
                        ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                        : isError
                            ? "#fef2f2"
                            : "#f8fafc",
                    color: isUser ? "#fff" : isError ? "#dc2626" : "#1e293b",
                    border: isUser ? "none" : isError ? "1px solid #fecaca" : "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    lineHeight: "1.6",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}
            >
                {message.content}
                <div
                    style={{
                        marginTop: "6px",
                        fontSize: "11px",
                        opacity: 0.6,
                        textAlign: isUser ? "right" : "left",
                    }}
                >
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
}

// ─── Indicador de escritura ───────────────────────────────────────────────────
function TypingIndicator() {
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "16px" }}>
            <div
                style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                }}
            >
                🤖
            </div>
            <div
                style={{
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                }}
            >
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "#94a3b8",
                            display: "inline-block",
                            animation: "bounce 1.2s infinite",
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function AIAssistant() {
    const { players } = useContext(ContextApp);
    const location = useLocation();

    // Detectar si estamos en la página de un jugador
    const match = matchPath({ path: "/player/:playerId/*" }, location.pathname);
    const currentPlayerId = match?.params?.playerId;
    const currentPlayer = players.find(p => String(p.id) === String(currentPlayerId));
    const playerName = currentPlayer?.name;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Inicializar chat con saludo
    useEffect(() => {
        if (messages.length === 0 && players.length > 0) {
            setMessages([
                {
                    role: "assistant",
                    content: `¡Hola! Soy tu asistente financiero ⚽\n\nPodés preguntarme sobre ingresos, gastos, balances y resúmenes mensuales. ¿En qué te ayudo?`,
                    timestamp: new Date(),
                },
            ]);
        }
    }, [players]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setUnread(0);
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const sendMessage = async (text) => {
        const question = (text || input).trim();
        console.log('Intentando enviar mensaje:', question);
        if (!question || loading) return;

        const userMsg = { role: "user", content: question, timestamp: new Date() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            const history = updatedMessages.slice(1).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const API_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:3000'
                : 'https://dashboard-backend-kmpv.onrender.com';

            const { data } = await axios.post(`${API_URL}/ai/ask`, {
                question,
                history: history.slice(0, -1),
                playerId: currentPlayerId,
            });

            if (data.success === false) throw new Error(data.error || "Error desconocido");

            const assistantMsg = {
                role: "assistant",
                content: data.answer,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);

            if (!isOpen) setUnread((u) => u + 1);
        } catch (err) {
            console.error("Chat error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: err.response?.data?.error || err.message || "Hubo un error. Intentá de nuevo.",
                    timestamp: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: "assistant",
                content: `Chat reiniciado. ¿En qué te puedo ayudar${playerName ? ` con ${playerName}` : ""}?`,
                timestamp: new Date(),
            },
        ]);
    };

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                title="Asistente IA"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "none",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(22,163,74,0.4)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.08)";
                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(22,163,74,0.5)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,0.4)";
                }}
            >
                {isOpen ? "✕" : "⚽"}
                {unread > 0 && !isOpen && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            background: "#dc2626",
                            color: "#fff",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                        }}
                    >
                        {unread}
                    </span>
                )}
            </button>

            {/* Panel de chat */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "92px",
                        right: "24px",
                        width: "380px",
                        maxHeight: "600px",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                        display: "flex",
                        flexDirection: "column",
                        background: "#fff",
                        zIndex: 999,
                        border: "1px solid #e2e8f0",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "16px 20px",
                            background: "linear-gradient(135deg, #16a34a, #15803d)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ fontSize: "22px" }}>⚽</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: "15px" }}>Asistente Financiero</div>
                                <div style={{ fontSize: "12px", opacity: 0.85 }}>
                                    {playerName ? `Contexto: ${playerName}` : "Todos los jugadores"}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            title="Limpiar chat"
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                border: "none",
                                color: "#fff",
                                borderRadius: "8px",
                                padding: "4px 10px",
                                fontSize: "12px",
                                cursor: "pointer",
                            }}
                        >
                            Limpiar
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "16px",
                            background: "#f1f5f9",
                            minHeight: "300px",
                            maxHeight: "420px",
                        }}
                    >
                        {/* Preguntas sugeridas (solo al inicio) */}
                        {messages.length === 1 && (
                            <div style={{ marginBottom: "16px" }}>
                                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: 500 }}>
                                    Preguntas frecuentes:
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {SUGGESTED_QUESTIONS.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => sendMessage(q)}
                                            style={{
                                                background: "#fff",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "20px",
                                                padding: "5px 12px",
                                                fontSize: "12px",
                                                color: "#334155",
                                                cursor: "pointer",
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <MessageBubble key={i} message={msg} />
                        ))}

                        {loading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "#fff",
                            borderTop: "1px solid #e2e8f0",
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-end",
                        }}
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Preguntá sobre gastos, ingresos o balances..."
                            disabled={loading}
                            rows={1}
                            style={{
                                flex: 1,
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "10px 14px",
                                fontSize: "14px",
                                resize: "none",
                                outline: "none",
                                fontFamily: "inherit",
                                lineHeight: "1.4",
                                maxHeight: "80px",
                                overflowY: "auto",
                                background: loading ? "#f8fafc" : "#fff",
                                color: "#1e293b",
                                transition: "border-color 0.15s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                border: "none",
                                background:
                                    loading || !input.trim()
                                        ? "#e2e8f0"
                                        : "linear-gradient(135deg, #16a34a, #15803d)",
                                color: loading || !input.trim() ? "#94a3b8" : "#fff",
                                fontSize: "18px",
                                cursor: loading || !input.trim() ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                transition: "all 0.15s",
                            }}
                        >
                            {loading ? "⏳" : "➤"}
                        </button>
                    </div>
                </div>
            )}

            {/* Animación bounce para el indicador de escritura */}
            <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
        </>
    );
}
