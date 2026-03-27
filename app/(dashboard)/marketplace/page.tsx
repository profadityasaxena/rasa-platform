"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Tag } from "lucide-react"
import { Card } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Spinner from "@/components/ui/Spinner"
import Modal from "@/components/ui/Modal"

interface Offer {
  _id: string
  title: string
  description: string
  creditCost: number
  stock?: number
  expiresAt?: string
  imageUrl?: string
}

export default function MarketplacePage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Offer | null>(null)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemCode, setRedeemCode] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then(({ offers }) => {
        setOffers(offers ?? [])
        setLoading(false)
      })
  }, [])

  async function redeem() {
    if (!selected) return
    setRedeeming(true)
    const res = await fetch(`/api/marketplace/${selected._id}/redeem`, { method: "POST" })
    const json = await res.json()
    setRedeeming(false)
    if (res.ok) {
      setRedeemCode(json.code)
    } else {
      alert(json.error ?? "Redemption failed.")
      setSelected(null)
    }
  }

  function closeModal() {
    setSelected(null)
    setRedeemCode(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Marketplace</h1>
        <p className="text-sm text-gray-500 mt-1">Spend your time credits on exclusive offers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : offers.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No offers available yet. Check back soon.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Card key={offer._id} padding="none" className="overflow-hidden">
              {offer.imageUrl ? (
                <img src={offer.imageUrl} alt={offer.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-[#C96BCF]/20 to-[#5ED3A5]/20 flex items-center justify-center">
                  <Tag size={32} className="text-[#C96BCF]" />
                </div>
              )}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-[#1F2937]">{offer.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{offer.creditCost} credits</Badge>
                  {offer.stock !== undefined && (
                    <span className="text-xs text-gray-400">{offer.stock} left</span>
                  )}
                </div>
                <Button fullWidth size="sm" onClick={() => setSelected(offer)}>
                  Redeem
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={closeModal}
        title={redeemCode ? "Redemption Code" : "Confirm Redemption"}
        footer={
          redeemCode ? (
            <Button onClick={closeModal}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button loading={redeeming} onClick={redeem}>
                Confirm ({selected?.creditCost} credits)
              </Button>
            </>
          )
        }
      >
        {redeemCode ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">Show this code to the partner:</p>
            <p className="text-3xl font-bold tracking-widest text-[#1E4FA1] font-mono">{redeemCode}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#1F2937]">
              Are you sure you want to redeem <strong>{selected?.title}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              This will deduct <strong>{selected?.creditCost} credits</strong> from your wallet.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
