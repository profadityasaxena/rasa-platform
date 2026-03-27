import {
  findOrgById,
  findOrgsByAdminUserId,
  updateOrganization,
  listActiveOrgs,
  submitOrganizationRequest,
  findOrgRequestById,
  listOrgRequests,
  approveOrgRequest,
  rejectOrgRequest,
} from "./repository"
import type {
  OrganizationDTO,
  UpdateOrganizationInput,
  OrganizationRequestDTO,
  SubmitOrgRequestInput,
  ReviewOrgRequestInput,
} from "./types"

// ─── Organization Profile Management ─────────────────────────────────────────

export async function getMyOrgs(userId: string): Promise<OrganizationDTO[]> {
  return findOrgsByAdminUserId(userId)
}

export async function getOrgById(id: string): Promise<OrganizationDTO | null> {
  return findOrgById(id)
}

export async function updateOrgProfile(
  id: string,
  userId: string,
  input: UpdateOrganizationInput
): Promise<{ success: true; org: OrganizationDTO } | { success: false; error: string }> {
  const org = await findOrgById(id)
  if (!org) return { success: false, error: "Organisation not found." }
  if (!org.adminUserIds.includes(userId)) return { success: false, error: "Forbidden." }
  const updated = await updateOrganization(id, input)
  return updated ? { success: true, org: updated } : { success: false, error: "Update failed." }
}

export { listActiveOrgs }

// ─── Organization Request Flow ────────────────────────────────────────────────

export async function submitOrgRequest(
  input: SubmitOrgRequestInput
): Promise<{ success: true; request: OrganizationRequestDTO } | { success: false; error: string }> {
  try {
    const request = await submitOrganizationRequest(input)
    return { success: true, request }
  } catch (err) {
    console.error("[org-request] Submit error:", err)
    return { success: false, error: "Failed to submit request." }
  }
}

export async function getOrgRequestById(
  id: string
): Promise<OrganizationRequestDTO | null> {
  return findOrgRequestById(id)
}

export async function getOrgRequests(
  status?: "pending" | "approved" | "rejected"
): Promise<OrganizationRequestDTO[]> {
  return listOrgRequests(status)
}

export async function reviewOrgRequest(
  requestId: string,
  reviewerUserId: string,
  input: ReviewOrgRequestInput
): Promise<
  | { success: true; request: OrganizationRequestDTO; org?: OrganizationDTO }
  | { success: false; error: string }
> {
  const existing = await findOrgRequestById(requestId)
  if (!existing) return { success: false, error: "Request not found." }
  if (existing.status !== "pending") return { success: false, error: "Request has already been reviewed." }

  try {
    if (input.decision === "approved") {
      const { request, org } = await approveOrgRequest(requestId, reviewerUserId, input.reviewNotes)
      return { success: true, request, org }
    } else {
      const request = await rejectOrgRequest(requestId, reviewerUserId, input.reviewNotes)
      return { success: true, request }
    }
  } catch (err) {
    console.error("[org-request] Review error:", err)
    return { success: false, error: "Review failed." }
  }
}
