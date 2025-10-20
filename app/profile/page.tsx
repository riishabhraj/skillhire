"use client"

import type React from "react"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [headline, setHeadline] = useState("")
  const [location, setLocation] = useState("")
  const [skills, setSkills] = useState("React, TypeScript, Next.js")

  function save(e: React.FormEvent) {
    e.preventDefault()
    // TODO: hook up to API
    console.log("[v0] save profile", { name, headline, location, skills })
    alert("Profile saved (mock).")
  }

  return (
    <main>
      <PageHeader title="Your Profile" description="Update your personal info and skills." />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <SectionCard>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm">Name</span>
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Headline</span>
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm">Location</span>
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Skills</span>
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button className="rounded-md border border-border bg-primary px-4 py-2 text-sm text-primary-foreground">
                Save changes
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </main>
  )
}
