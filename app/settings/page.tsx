import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"

export default function SettingsPage() {
  return (
    <main>
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <SectionCard title="Notifications">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" defaultChecked />
            <span className="text-sm">Email me about new matching roles</span>
          </label>
        </SectionCard>
        <SectionCard title="Privacy">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" defaultChecked />
            <span className="text-sm">Allow employers to discover my profile</span>
          </label>
        </SectionCard>
      </div>
    </main>
  )
}
