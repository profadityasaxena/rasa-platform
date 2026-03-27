import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "RASA — Civic Contribution Platform",
  description: "Connect volunteers with NGO missions and earn recognition for your impact.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
