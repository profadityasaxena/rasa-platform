/**
 * AI integration module using Anthropic Claude API.
 * Used for:
 *   1. Document intelligence — extract structured data from uploaded org documents
 *   2. GAIA — NGO AI assistant for mission descriptions, volunteer matching insights
 */

import { connectToDatabase } from "@/lib/db/mongoose"
import { VaultDocumentModel } from "@/lib/db/models/vault.model"
import { getR2PublicUrl } from "@/adapters/storage/r2"
import { isDebugMode } from "@/lib/debug/guard"

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
const CLAUDE_MODEL = "claude-sonnet-4-6"

async function callClaude(params: {
  system: string
  userMessage: string
}): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set")

  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: params.system,
      messages: [{ role: "user", content: params.userMessage }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Claude API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ""
}

/**
 * Extract structured data from a vault document (org registration, etc.)
 * Returns a JSON object with extracted fields.
 */
export async function extractDocumentData(vaultDocId: string): Promise<Record<string, unknown>> {
  await connectToDatabase()
  const doc = await VaultDocumentModel.findById(vaultDocId)
  if (!doc) throw new Error("Document not found")

  const fileUrl = getR2PublicUrl(doc.r2Key, isDebugMode)

  const response = await callClaude({
    system: `You are a document analysis assistant for a civic platform.
Extract key information from organisation registration documents and return valid JSON only.
Fields to extract: registrationNumber, legalName, taxId, address, country, registrationDate.
Return {} if information is not found. Return only JSON, no explanation.`,
    userMessage: `Please extract the key details from this document: ${fileUrl}
Document type: ${doc.type}
File name: ${doc.fileName}`,
  })

  try {
    return JSON.parse(response)
  } catch {
    return { rawResponse: response }
  }
}

/**
 * GAIA — AI assistant for NGO admins.
 * Generates mission descriptions, analyzes volunteer pools, etc.
 */
export async function gaiaChat(params: {
  orgName: string
  history: { role: "user" | "assistant"; content: string }[]
  userMessage: string
}): Promise<string> {
  const messages = [
    ...params.history,
    { role: "user" as const, content: params.userMessage },
  ]

  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: `You are GAIA, an AI assistant for ${params.orgName}, an NGO on the RASA civic platform.
You help NGO staff write compelling mission descriptions, analyse volunteer applications,
draft communications, and get insights from their volunteering data.
Be concise, professional, and helpful. Respond in the same language the user writes in.`,
      messages,
    }),
  })

  if (!res.ok) throw new Error(`GAIA API error: ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text ?? ""
}
