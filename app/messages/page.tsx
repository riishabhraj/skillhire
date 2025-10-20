import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"

const THREADS = [
  { id: "t1", with: "Acme Corp", last: "Can we schedule a quick call?" },
  { id: "t2", with: "SkillHire", last: "Thanks for applying! Next steps..." },
]

export default function MessagesPage() {
  return (
    <main>
      <PageHeader title="Messages" description="Conversations with employers and candidates." />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {THREADS.length ? (
          <SectionCard>
            <ul className="divide-y divide-border">
              {THREADS.map((t) => (
                <li key={t.id} className="py-3">
                  <Link href={`/messages/${t.id}`} className="block">
                    <p className="text-sm font-medium">{t.with}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.last}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : (
          <EmptyState title="No messages yet" description="Start by applying or posting a job." />
        )}
      </div>
    </main>
  )
}
