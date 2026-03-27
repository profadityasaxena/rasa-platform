import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { OrganizationModel } from "@/lib/db/models/organization.model"
import { OrganizationRequestModel } from "@/lib/db/models/organization-request.model"
import type {
  OrganizationDTO,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrgType,
  OrganizationRequestDTO,
  SubmitOrgRequestInput,
} from "./types"

function toDTO(doc: InstanceType<typeof OrganizationModel>): OrganizationDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    status: doc.status,
    description: doc.description,
    mission: doc.mission,
    logoUrl: doc.logoUrl,
    website: doc.website,
    contactEmail: doc.contactEmail,
    contactPhone: doc.contactPhone,
    headquarters: doc.headquarters,
    focusAreas: doc.focusAreas,
    sdgAlignment: doc.sdgAlignment,
    verificationStatus: doc.verificationStatus,
    adminUserIds: doc.adminUserIds.map((id: mongoose.Types.ObjectId) => id.toString()),
    createdAt: doc.createdAt.toISOString(),
  }
}

function requestToDTO(doc: InstanceType<typeof OrganizationRequestModel>): OrganizationRequestDTO {
  return {
    id: doc._id.toString(),
    organizationType: doc.organizationType,
    name: doc.name,
    description: doc.description,
    mission: doc.mission,
    website: doc.website,
    contactName: doc.contactName,
    contactEmail: doc.contactEmail,
    contactPhone: doc.contactPhone,
    headquartersCity: doc.headquartersCity,
    headquartersCountry: doc.headquartersCountry,
    purposeStatement: doc.purposeStatement,
    status: doc.status,
    reviewedAt: doc.reviewedAt?.toISOString(),
    reviewNotes: doc.reviewNotes,
    createdOrganizationId: doc.createdOrganizationId?.toString(),
    createdAt: doc.createdAt.toISOString(),
  }
}

// ─── Organization CRUD ────────────────────────────────────────────────────────

export async function createOrganization(
  adminUserId: string,
  input: CreateOrganizationInput
): Promise<OrganizationDTO> {
  await connectToDatabase()
  const doc = await OrganizationModel.create({
    ...input,
    status: "active",
    adminUserIds: [new mongoose.Types.ObjectId(adminUserId)],
  })
  return toDTO(doc)
}

export async function findOrgById(id: string): Promise<OrganizationDTO | null> {
  await connectToDatabase()
  const doc = await OrganizationModel.findById(id)
  return doc ? toDTO(doc) : null
}

export async function findOrgsByAdminUserId(userId: string): Promise<OrganizationDTO[]> {
  await connectToDatabase()
  const docs = await OrganizationModel.find({
    adminUserIds: new mongoose.Types.ObjectId(userId),
  })
  return docs.map(toDTO)
}

export async function updateOrganization(
  id: string,
  input: UpdateOrganizationInput
): Promise<OrganizationDTO | null> {
  await connectToDatabase()
  const doc = await OrganizationModel.findByIdAndUpdate(id, input, { new: true })
  return doc ? toDTO(doc) : null
}

export async function listActiveOrgs(type?: OrgType): Promise<OrganizationDTO[]> {
  await connectToDatabase()
  const filter: Record<string, unknown> = { status: "active" }
  if (type) filter.type = type
  const docs = await OrganizationModel.find(filter).limit(100)
  return docs.map(toDTO)
}

// ─── Organization Requests ────────────────────────────────────────────────────

export async function submitOrganizationRequest(
  input: SubmitOrgRequestInput
): Promise<OrganizationRequestDTO> {
  await connectToDatabase()
  const doc = await OrganizationRequestModel.create(input)
  return requestToDTO(doc)
}

export async function findOrgRequestById(id: string): Promise<OrganizationRequestDTO | null> {
  await connectToDatabase()
  const doc = await OrganizationRequestModel.findById(id)
  return doc ? requestToDTO(doc) : null
}

export async function listOrgRequests(
  status?: "pending" | "approved" | "rejected"
): Promise<OrganizationRequestDTO[]> {
  await connectToDatabase()
  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  const docs = await OrganizationRequestModel.find(filter).sort({ createdAt: -1 }).limit(200)
  return docs.map(requestToDTO)
}

export async function approveOrgRequest(
  requestId: string,
  reviewerUserId: string,
  reviewNotes?: string
): Promise<{ request: OrganizationRequestDTO; org: OrganizationDTO }> {
  await connectToDatabase()

  const request = await OrganizationRequestModel.findById(requestId)
  if (!request) throw new Error("Request not found")

  // Create the organization
  const orgDoc = await OrganizationModel.create({
    name: request.name,
    type: request.organizationType,
    status: "active",
    description: request.description,
    mission: request.mission,
    website: request.website,
    contactEmail: request.contactEmail,
    contactPhone: request.contactPhone,
    headquarters: request.headquartersCity
      ? { city: request.headquartersCity, country: request.headquartersCountry }
      : undefined,
    adminUserIds: [],
    verificationStatus: "unverified",
  })

  // Mark request approved
  request.status = "approved"
  request.reviewedByUserId = new mongoose.Types.ObjectId(reviewerUserId)
  request.reviewedAt = new Date()
  request.reviewNotes = reviewNotes
  request.createdOrganizationId = orgDoc._id
  await request.save()

  return { request: requestToDTO(request), org: toDTO(orgDoc) }
}

export async function rejectOrgRequest(
  requestId: string,
  reviewerUserId: string,
  reviewNotes?: string
): Promise<OrganizationRequestDTO> {
  await connectToDatabase()

  const request = await OrganizationRequestModel.findById(requestId)
  if (!request) throw new Error("Request not found")

  request.status = "rejected"
  request.reviewedByUserId = new mongoose.Types.ObjectId(reviewerUserId)
  request.reviewedAt = new Date()
  request.reviewNotes = reviewNotes
  await request.save()

  return requestToDTO(request)
}
