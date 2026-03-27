export type OrgType =
  | "ngo"
  | "corporation"
  | "government"
  | "university"
  | "marketplace_partner"

export type OrgStatus = "pending_approval" | "active" | "suspended"

export type OrgRequestStatus = "pending" | "approved" | "rejected"

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  ngo: "NGO / Nonprofit",
  corporation: "Corporation / Business",
  government: "Government Body",
  university: "University / Educational Institution",
  marketplace_partner: "Marketplace Partner / Seller",
}

export interface OrgHeadquarters {
  street?: string
  city: string
  province?: string
  postalCode?: string
  country?: string
  lat?: number
  lng?: number
}

export interface OrganizationDTO {
  id: string
  name: string
  type: OrgType
  status: OrgStatus
  description?: string
  mission?: string
  logoUrl?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  headquarters?: OrgHeadquarters
  focusAreas?: string[]
  sdgAlignment?: string[]
  verificationStatus?: "unverified" | "verified" | "rejected"
  adminUserIds: string[]
  createdAt: string
}

export interface CreateOrganizationInput {
  name: string
  type: OrgType
  description?: string
  mission?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  headquarters?: OrgHeadquarters
  focusAreas?: string[]
  sdgAlignment?: string[]
}

export interface UpdateOrganizationInput {
  name?: string
  description?: string
  mission?: string
  logoUrl?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  headquarters?: OrgHeadquarters
  focusAreas?: string[]
  sdgAlignment?: string[]
}

export interface OrganizationRequestDTO {
  id: string
  organizationType: OrgType
  name: string
  description?: string
  mission?: string
  website?: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  headquartersCity?: string
  headquartersCountry?: string
  purposeStatement?: string
  status: OrgRequestStatus
  reviewedAt?: string
  reviewNotes?: string
  createdOrganizationId?: string
  createdAt: string
}

export interface SubmitOrgRequestInput {
  organizationType: OrgType
  name: string
  description?: string
  mission?: string
  website?: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  headquartersCity?: string
  headquartersCountry?: string
  purposeStatement?: string
}

export interface ReviewOrgRequestInput {
  decision: "approved" | "rejected"
  reviewNotes?: string
}
