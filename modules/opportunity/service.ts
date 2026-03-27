import {
  createOpportunity,
  findOpportunityById,
  findOpportunitiesByOrg,
  listOpenOpportunities,
  updateOpportunity,
} from "./repository"
import { findOrgsByAdminUserId } from "@/modules/organization/repository"
import type { CreateOpportunityInput, OpportunityDTO, UpdateOpportunityInput } from "./types"

export async function createMission(
  userId: string,
  input: CreateOpportunityInput
): Promise<{ success: true; opportunity: OpportunityDTO } | { success: false; error: string }> {
  const orgs = await findOrgsByAdminUserId(userId)
  if (!orgs.some((o) => o.id === input.organizationId)) {
    return { success: false, error: "Forbidden." }
  }
  const opportunity = await createOpportunity(input)
  return { success: true, opportunity }
}

export async function getOpportunity(id: string): Promise<OpportunityDTO | null> {
  return findOpportunityById(id)
}

export async function getOrgMissions(userId: string, orgId: string): Promise<OpportunityDTO[]> {
  const orgs = await findOrgsByAdminUserId(userId)
  if (!orgs.some((o) => o.id === orgId)) return []
  return findOpportunitiesByOrg(orgId)
}

export async function updateMission(
  id: string,
  userId: string,
  input: UpdateOpportunityInput
): Promise<{ success: true; opportunity: OpportunityDTO } | { success: false; error: string }> {
  const opp = await findOpportunityById(id)
  if (!opp) return { success: false, error: "Opportunity not found." }
  const orgs = await findOrgsByAdminUserId(userId)
  if (!orgs.some((o) => o.id === opp.organizationId)) {
    return { success: false, error: "Forbidden." }
  }
  const updated = await updateOpportunity(id, input)
  return updated ? { success: true, opportunity: updated } : { success: false, error: "Update failed." }
}

export { listOpenOpportunities }
