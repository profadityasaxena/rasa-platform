import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db/mongoose"
import { OrganizationRequestModel } from "@/lib/db/models/organization-request.model"
import { OrganizationModel } from "@/lib/db/models/organization.model"
import { Card } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import ReviewActions from "./ReviewActions"
import { ORG_TYPE_LABELS } from "@/modules/organization/types"

export default async function AdminOrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  const user = session?.user as { id?: string; role?: string } | undefined
  if (!user?.id || !user.role?.startsWith("platform_")) redirect("/dashboard")

  const { tab = "requests" } = await searchParams

  await connectToDatabase()

  const [pendingRequests, allRequests, allOrgs] = await Promise.all([
    OrganizationRequestModel.find({ status: "pending" }).sort({ createdAt: -1 }).lean(),
    OrganizationRequestModel.find({}).sort({ createdAt: -1 }).limit(100).lean(),
    OrganizationModel.find({}).sort({ createdAt: -1 }).limit(200).lean(),
  ])

  const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
    pending:  "warning",
    approved: "success",
    rejected: "danger",
  }

  const orgStatusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
    active:           "success",
    pending_approval: "warning",
    suspended:        "danger",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Organisations</h1>
          {pendingRequests.length > 0 && (
            <p className="text-sm text-[#D62828] mt-0.5 font-medium">
              {pendingRequests.length} request{pendingRequests.length !== 1 ? "s" : ""} pending review
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <TabLink href="/admin/organisations?tab=requests" active={tab === "requests"}>
          Requests
          {pendingRequests.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-[#D62828] text-white font-bold">
              {pendingRequests.length}
            </span>
          )}
        </TabLink>
        <TabLink href="/admin/organisations?tab=organisations" active={tab === "organisations"}>
          Organisations ({allOrgs.length})
        </TabLink>
      </div>

      {/* Organisation Requests tab */}
      {tab === "requests" && (
        <Card padding="none">
          {allRequests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No organisation requests yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Organisation</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {allRequests.map((r) => (
                  <tr key={r._id.toString()} className="border-b border-gray-50 hover:bg-gray-50 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2937]">{r.name}</p>
                      {r.website && (
                        <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1E4FA1] hover:underline">
                          {r.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                      {r.description && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-50 line-clamp-2">{r.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{ORG_TYPE_LABELS[r.organizationType as keyof typeof ORG_TYPE_LABELS] ?? String(r.organizationType)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#1F2937]">{r.contactName}</p>
                      <p className="text-xs text-gray-400">{r.contactEmail}</p>
                      {r.contactPhone && <p className="text-xs text-gray-400">{r.contactPhone}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {[r.headquartersCity, r.headquartersCountry].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[r.status] ?? "default"}>{r.status}</Badge>
                      {r.reviewNotes && (
                        <p className="text-xs text-gray-400 mt-1 max-w-30 line-clamp-2">{r.reviewNotes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "pending" ? (
                        <ReviewActions requestId={r._id.toString()} />
                      ) : r.status === "approved" && r.createdOrganizationId ? (
                        <span className="text-xs text-gray-400">Org created</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Organisations tab */}
      {tab === "organisations" && (
        <Card padding="none">
          {allOrgs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No organisations on the platform yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Organisation</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Verification</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {allOrgs.map((o) => (
                  <tr key={o._id.toString()} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2937]">{o.name}</p>
                      {o.website && (
                        <a href={o.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1E4FA1] hover:underline">
                          {o.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{ORG_TYPE_LABELS[o.type as keyof typeof ORG_TYPE_LABELS] ?? String(o.type)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {o.contactEmail ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={orgStatusVariant[o.status] ?? "default"}>{o.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={o.verificationStatus === "verified" ? "success" : o.verificationStatus === "rejected" ? "danger" : "default"}>
                        {o.verificationStatus ?? "unverified"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-white text-[#1F2937] shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </Link>
  )
}
