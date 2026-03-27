"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Star } from "lucide-react"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"
import Modal from "@/components/ui/Modal"
import Textarea from "@/components/ui/Textarea"

interface ParticipationForFeedback {
  _id: string
  status: string
  creditsAwarded: number
  opportunityId?: { _id: string; title?: string }
  feedbackSubmitted?: boolean
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={n <= value ? "text-[#FFD60A]" : "text-gray-300"}
        >
          <Star size={20} fill={n <= value ? "#FFD60A" : "none"} />
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const [participations, setParticipations] = useState<ParticipationForFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ParticipationForFeedback | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/participation/my")
      .then((r) => r.json())
      .then(({ participations }) => {
        setParticipations((participations ?? []).filter((p: ParticipationForFeedback) => p.status === "completed"))
        setLoading(false)
      })
  }, [])

  async function submitFeedback() {
    if (!selected || rating === 0) return
    setSubmitting(true)
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participationId: selected._id,
        opportunityId: selected.opportunityId?._id,
        orgRating: rating,
        orgComment: comment,
      }),
    })
    setSubmitting(false)
    setSelected(null)
    setRating(0)
    setComment("")
    // Mark as submitted locally
    setParticipations((prev) =>
      prev.map((p) => (p._id === selected._id ? { ...p, feedbackSubmitted: true } : p))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">Rate your experience after each mission</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : participations.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No completed participations to review yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {participations.map((p) => (
            <Card key={p._id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#1F2937]">
                    {p.opportunityId?.title ?? "Mission"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="success">{p.creditsAwarded} credits earned</Badge>
                  </div>
                </div>
                {p.feedbackSubmitted ? (
                  <Badge variant="default">Submitted</Badge>
                ) : (
                  <Button size="sm" onClick={() => setSelected(p)}>
                    Leave feedback
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Rate this mission"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            <Button loading={submitting} disabled={rating === 0} onClick={submitFeedback}>
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#1F2937] mb-2">How was your experience?</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea
            label="Comments (optional)"
            placeholder="Share your thoughts about the mission…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
