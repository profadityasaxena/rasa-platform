/**
 * Cloudflare R2 storage adapter using S3-compatible API.
 * Requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT.
 */

import crypto from "crypto"

interface UploadParams {
  key: string
  body: Buffer | Uint8Array
  contentType: string
  debug?: boolean
}

interface PresignedUrlParams {
  key: string
  expiresIn?: number // seconds, default 3600
  debug?: boolean
}

function getEndpoint(debug = false): string {
  const endpoint = process.env.R2_ENDPOINT
  if (!endpoint) throw new Error("R2_ENDPOINT not set")
  return endpoint
}

function getBucket(debug = false): string {
  return debug
    ? (process.env.R2_BUCKET_NAME_DEBUG ?? process.env.R2_BUCKET_NAME ?? "")
    : (process.env.R2_BUCKET_NAME ?? "")
}

function getCredentials() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accessKeyId || !secretAccessKey) throw new Error("R2 credentials not set")
  return { accessKeyId, secretAccessKey }
}

// HMAC-SHA256 helper
function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest()
}

function sha256(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

/**
 * Upload a file to R2 using AWS Signature V4.
 */
export async function uploadToR2(params: UploadParams): Promise<string> {
  const { accessKeyId, secretAccessKey } = getCredentials()
  const bucket = getBucket(params.debug)
  const endpoint = getEndpoint(params.debug)
  const url = `${endpoint}/${bucket}/${params.key}`

  const now = new Date()
  const dateStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 8)
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
  const region = "auto"
  const service = "s3"

  const payloadHash = sha256(params.body as Buffer)
  const host = new URL(url).host

  const canonicalHeaders = `content-type:${params.contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date"
  const canonicalRequest = [
    "PUT",
    `/${bucket}/${params.key}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n")

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n")

  const kDate = hmacSha256(Buffer.from(`AWS4${secretAccessKey}`), dateStamp)
  const kRegion = hmacSha256(kDate, region)
  const kService = hmacSha256(kRegion, service)
  const kSigning = hmacSha256(kService, "aws4_request")
  const signature = hmacSha256(kSigning, stringToSign).toString("hex")

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": params.contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization,
    },
    body: params.body as BodyInit,
  })

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status} ${await response.text()}`)
  }

  return params.key
}

/**
 * Generate a public URL for a key (for public buckets) or use presigned URLs for private buckets.
 * For MVP, we return a direct R2 URL — configure bucket policy separately.
 */
export function getR2PublicUrl(key: string, debug = false): string {
  const endpoint = getEndpoint(debug)
  const bucket = getBucket(debug)
  return `${endpoint}/${bucket}/${key}`
}
