import Link from "next/link"

export type Job = {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  tags?: string[]
  postedAt?: string
}

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="group rounded-lg border border-border bg-card p-4 transition hover:shadow-sm">
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h3 className="text-base font-semibold leading-none">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.company} • {job.location}
          </p>
          {job.salary ? <p className="mt-1 text-sm text-muted-foreground">{job.salary}</p> : null}
          {job.tags?.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="rounded-md border border-border bg-primary px-3 py-1.5 text-sm text-primary-foreground transition hover:opacity-90"
          aria-label={`View details for ${job.title}`}
        >
          View
        </Link>
      </div>
      {job.postedAt ? <p className="mt-3 text-xs text-muted-foreground">Posted {job.postedAt}</p> : null}
    </article>
  )
}
