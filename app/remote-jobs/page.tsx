import { Metadata } from "next"
import { RemoteJobsList } from "@/components/remote-jobs-list"

export const metadata: Metadata = {
  title: "Remote Jobs - SkillHire",
  description: "Discover remote job opportunities from top companies worldwide. Find your next remote position today.",
}

export default function RemoteJobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Remote Jobs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing remote job opportunities from companies worldwide. 
            All jobs are sourced from Remotive and updated regularly.
          </p>
        </div>
        
        <RemoteJobsList />
      </div>
    </div>
  )
}
