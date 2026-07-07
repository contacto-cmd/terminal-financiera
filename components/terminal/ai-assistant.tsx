"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Send, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

const SUGGESTIONS = [
  "¿Cómo está Bitcoin ahora mismo?",
  "Análisis técnico de ETH a 30 días",
  "¿Qué monedas suben más hoy?",
]

const TOOL_LABELS: Record<string, string> = {
  "tool-getMarketData": "Consultando precios en vivo",
  "tool-getTechnicalAnalysis": "Calculando indicadores técnicos",
}

export function AiAssistant() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  function submit(text: string) {
    if (!text.trim() || status !== "ready") return
    sendMessage({ text })
    setInput("")
  }

  return (
    <section className="flex h-full min-h-[520px] flex-col rounded-lg border border-border bg-card" aria-label="Agente de IA">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" aria-hidden />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold leading-tight">Satoshi · Agente IA</h2>
          <p className="font-mono text-[10px] text-muted-foreground">Analista de mercado en tiempo real</p>
        </div>
        <span className="font-mono text-[10px] uppercase text-gain">online</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 p-3">
              <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Soy tu analista de mercado. Puedo consultar precios en vivo y calcular indicadores técnicos
                (RSI, SMA, tendencia) sobre datos reales. Pregúntame lo que quieras.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <span key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </span>
                  )
                }
                if (part.type.startsWith("tool-")) {
                  const label = TOOL_LABELS[part.type] ?? "Ejecutando herramienta"
                  return (
                    <div
                      key={i}
                      className="my-1 flex items-center gap-2 font-mono text-[11px] text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
                      {label}…
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}

        {(status === "submitted" || status === "streaming") &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-secondary px-3 py-2">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </span>
              </div>
            </div>
          )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              submit(input)
            }
          }}
          placeholder="Pregunta sobre el mercado…"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          aria-label="Mensaje para el agente"
        />
        <Button type="submit" size="icon" disabled={status !== "ready" || !input.trim()} aria-label="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  )
}
