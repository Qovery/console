/**
 * Checks if a plan is a 2025 plan
 * @param plan - The plan name to check
 * @returns true if the plan is a 2025 plan, false otherwise
 */
export function is2025Plan(plan?: string): boolean {
  if (!plan) return false
  return plan.toUpperCase().includes('2025')
}

/**
 * Formats a plan name (capitalized, without Legacy suffix, removes _2025)
 * @param plan - The plan name to format
 * @returns The formatted plan name
 * @example
 * formatPlanName('TEAM') => 'Team'
 * formatPlanName('TEAM_2025') => 'Team'
 * formatPlanName('ENTERPRISE_2025') => 'Enterprise'
 */
export function formatPlanName(plan?: string): string {
  if (!plan) return 'N/A'

  // Remove _2025 suffix if present
  const planWithoutSuffix = plan.replace(/_2025$/i, '')

  return planWithoutSuffix.charAt(0).toUpperCase() + planWithoutSuffix.slice(1).toLowerCase()
}

/**
 * Formats a plan name with "plan" and "(Legacy)" suffix if it's not a 2025 plan
 * @param plan - The plan name to format
 * @returns The formatted plan name with "plan" suffix and optional "(Legacy)"
 * @example
 * formatPlanDisplay('TEAM') => 'Team plan (Legacy)'
 * formatPlanDisplay('TEAM_2025') => 'Team plan'
 * formatPlanDisplay('ENTERPRISE') => 'Enterprise plan (Legacy)'
 * formatPlanDisplay('ENTERPRISE_2025') => 'Enterprise plan'
 */
export function formatPlanDisplay(plan?: string): string {
  if (!plan) return 'N/A plan'

  const isLegacy = !is2025Plan(plan)
  const planName = formatPlanName(plan)

  return isLegacy ? `${planName} plan (Legacy)` : `${planName} plan`
}
