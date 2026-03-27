"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Spinner from "@/components/ui/Spinner"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function GAIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm GAIA, your AI assistant. I can help you write mission descriptions, analyse applications, draft communications, and more. How can I help today?",
    },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    if (!input.trim() || sending) return
    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    try {
      const res = await fetch("/api/gaia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-10), // send last 10 messages
        }),
      })
      const json = await res.json()
      const reply = json.response ?? json.error ?? "Sorry, I couldn't respond right now."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ])
    } finally {
      setSending(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-[#C96BCF]" />
        <h1 className="text-2xl font-bold text-[#1F2937]">GAIA — AI Assistant</h1>
      </div>

      {/* Messages */}
      <Card padding="none" className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-[#C96BCF] text-white"
                  : "bg-gray-100 text-[#1F2937]",
              ].join(" ")}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Spinner size="sm" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </Card>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <textarea
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C96BCF] focus:border-transparent"
          rows={2}
          placeholder="Ask GAIA anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button onClick={send} loading={sending} disabled={!input.trim()}>
          <Send size={15} />
        </Button>
      </div>
    </div>
  )
}
