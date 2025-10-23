/**
 * Email validation utilities for role-based authentication
 * Ensures employers use company emails and candidates can use any email
 */

// List of common free email providers
const FREE_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'gmx.com',
  'yandex.com',
  'zoho.com',
  'tutanota.com',
  'fastmail.com',
  'hushmail.com',
  'inbox.com',
  'me.com',
  'mac.com',
]

/**
 * Check if an email is from a free email provider
 * @param email - Email address to check
 * @returns true if email is from a free provider, false otherwise
 */
export function isFreeEmailProvider(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const domain = email.split('@')[1]?.toLowerCase().trim()
  
  if (!domain) {
    return false
  }

  return FREE_EMAIL_PROVIDERS.includes(domain)
}

/**
 * Check if an email is a valid company email
 * @param email - Email address to check
 * @returns true if email appears to be from a company domain
 */
export function isCompanyEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // Check basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return false
  }

  // Company email = not from free provider
  return !isFreeEmailProvider(email)
}

/**
 * Get the domain from an email address
 * @param email - Email address
 * @returns Domain portion of the email
 */
export function getEmailDomain(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  const domain = email.split('@')[1]?.toLowerCase().trim()
  return domain || ''
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get user-friendly error message for invalid company email
 * @param email - Email address that failed validation
 * @returns Error message explaining why email is invalid
 */
export function getCompanyEmailErrorMessage(email: string): string {
  if (!email) {
    return 'Email address is required'
  }

  if (!isValidEmailFormat(email)) {
    return 'Please enter a valid email address'
  }

  if (isFreeEmailProvider(email)) {
    const domain = getEmailDomain(email)
    return `Personal email addresses (${domain}) are not accepted for employer accounts. Please use your company email (e.g., you@yourcompany.com)`
  }

  return 'Invalid email address'
}

