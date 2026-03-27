import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { FeedbackModel } from "@/lib/db/models/feedback.model"
import { z } from "zod"

export const submitFeedbackSchema = z.object({
  participationId: z.string().min(1),
  opportunityId: z.string().min(1),
  // Volunteer submits about the org
  orgRating: z.number().int().min(1).max(5).optional(),
  orgComment: z.string().max(500).optional(),
  // NGO submits about the volunteer
  volunteerRating: z.number().int().min(1).max(5).optional(),
  volunteerComment: z.string().max(500).optional(),
})

type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>

export async function submitFeedback(
  userId: string,
  role: "volunteer" | "ngo_admin",
  input: SubmitFeedbackInput
): Promise<{ success: true } | { success: false; error: string }> {
  await connectToDatabase()

  const existing = await FeedbackModel.findOne({
    participationId: new mongoose.Types.ObjectId(input.participationId),
    submittedByRole: role,
  })
  if (existing) return { success: false, error: "Feedback already submitted." }

  await FeedbackModel.create({
    opportunityId: new mongoose.Types.ObjectId(input.opportunityId),
    participationId: new mongoose.Types.ObjectId(input.participationId),
    submittedByUserId: new mongoose.Types.ObjectId(userId),
    submittedByRole: role,
    orgRating: input.orgRating,
    orgComment: input.orgComment,
    volunteerRating: input.volunteerRating,
    volunteerComment: input.volunteerComment,
  })

  return { success: true }
}

export async function getFeedbackForOpportunity(opportunityId: string) {
  await connectToDatabase()
  return FeedbackModel.find({ opportunityId: new mongoose.Types.ObjectId(opportunityId) })
    .sort({ createdAt: -1 })
    .lean()
}
