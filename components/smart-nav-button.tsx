"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { ReactNode } from "react"

interface SmartNavButtonProps {
  signedInHref: string
  signedOutHref: string
  className?: string
  children: ReactNode
}

export function SmartNavButton({ 
  signedInHref, 
  signedOutHref, 
  className,
  children 
}: SmartNavButtonProps) {
  const { isSignedIn, isLoaded } = useUser()

  // While loading, use signed-out href to avoid flash
  const href = isLoaded && isSignedIn ? signedInHref : signedOutHref

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

