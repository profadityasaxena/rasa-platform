import crypto from "crypto"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { VaultDocumentModel } from "@/lib/db/models/vault.model"
import { uploadToR2 } from "@/adapters/storage/r2"
import { isDebugMode } from "@/lib/debug/guard"
import type { VaultDocumentType } from "@/lib/db/models/vault.model"

export async function uploadDocument(params: {
  ownerId: string
  ownerType: "organization" | "user"
  type: VaultDocumentType
  fileName: string
  mimeType: string
  buffer: Buffer
  uploadedBy: string
}) {
  await connectToDatabase()

  const ext = params.fileName.split(".").pop() ?? "bin"
  const r2Key = `${params.ownerType}/${params.ownerId}/${params.type}/${crypto.randomBytes(8).toString("hex")}.${ext}`

  await uploadToR2({
    key: r2Key,
    body: params.buffer,
    contentType: params.mimeType,
    debug: isDebugMode,
  })

  const doc = await VaultDocumentModel.create({
    ownerId: new mongoose.Types.ObjectId(params.ownerId),
    ownerType: params.ownerType,
    type: params.type,
    fileName: params.fileName,
    mimeType: params.mimeType,
    sizeBytes: params.buffer.length,
    r2Key,
    processingStatus: "pending",
    uploadedBy: new mongoose.Types.ObjectId(params.uploadedBy),
  })

  // Fire-and-forget AI processing
  processDocumentAsync(doc._id.toString()).catch(console.error)

  return { id: doc._id.toString(), r2Key }
}

async function processDocumentAsync(docId: string): Promise<void> {
  // Dynamically import to avoid circular deps
  const { extractDocumentData } = await import("@/modules/ai/service")
  await VaultDocumentModel.findByIdAndUpdate(docId, { processingStatus: "processing" })
  try {
    const result = await extractDocumentData(docId)
    await VaultDocumentModel.findByIdAndUpdate(docId, {
      processingStatus: "done",
      extractedData: result,
    })
  } catch (err) {
    console.error("[vault] AI processing failed:", err)
    await VaultDocumentModel.findByIdAndUpdate(docId, { processingStatus: "failed" })
  }
}

export async function getDocumentsForOwner(ownerId: string) {
  await connectToDatabase()
  return VaultDocumentModel.find({ ownerId: new mongoose.Types.ObjectId(ownerId) })
    .sort({ createdAt: -1 })
    .lean()
}
