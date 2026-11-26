import type { PlanProposal } from '@qovery/shared/billing/data-access'

/** "3 days", "1 week", "2 weeks": the Remind me later choices. */
export function snoozeLabel(days: number): string {
  if (days % 7 === 0) return days === 7 ? '1 week' : `${days / 7} weeks`
  return days === 1 ? '1 day' : `${days} days`
}

/** Who suggests what: "<Sender> from Qovery suggests <Plan>", or "The Qovery team suggests <Plan>"
 * for a proposal sent as the team (no personal name then). */
export function proposalHeading(p: Pick<PlanProposal, 'sender_name' | 'send_as' | 'plan'>): string {
  return p.send_as === 'team' || !p.sender_name
    ? `The Qovery team suggests ${p.plan.name}`
    : `${p.sender_name} from Qovery suggests ${p.plan.name}`
}

/** The banner's line: the offer first when there is one ("10% off Scale for 6 months · The Qovery
 * team"), else the heading, then ": <one line>". */
export function proposalLine(p: Pick<PlanProposal, 'sender_name' | 'send_as' | 'plan' | 'headline' | 'offer'>): string {
  if (p.offer) return `${p.offer} · ${proposalSigner(p)}`
  const head = proposalHeading(p)
  return p.headline ? `${head}: ${p.headline}` : head
}

/** Who signs: "The Qovery team", or "Ada Lovelace, Qovery". */
export function proposalSigner(p: Pick<PlanProposal, 'sender_name' | 'send_as'>): string {
  return p.send_as === 'team' || !p.sender_name ? 'The Qovery team' : `${p.sender_name}, Qovery`
}

/** The banner's short line, below 640px: the offer, else the heading. */
export function proposalShortLine(p: Pick<PlanProposal, 'sender_name' | 'send_as' | 'plan' | 'offer'>): string {
  return p.offer || proposalHeading(p)
}

/** What the console's top bar shows: one banner, never stacked. The open plan proposal first, else
 * the first offer banner (offers come newest first and carry no priority of their own). */
export type BarBanner<O> = { kind: 'proposal'; proposal: PlanProposal } | { kind: 'offer'; offer: O }

export function barBanner<O>(
  proposal: PlanProposal | null | undefined,
  offers: readonly O[]
): BarBanner<O> | undefined {
  if (proposal) return { kind: 'proposal', proposal }
  return offers.length ? { kind: 'offer', offer: offers[0] } : undefined
}

/** The top bar's classes, on top of the console's <Banner>: one line at every width. The text
 * truncates with an ellipsis (its full version in a tooltip) and gives way to the button, which
 * never wraps; a closable bar keeps room for its close button. */
export const BAR_TEXT = 'min-w-0 truncate whitespace-nowrap'

export function barClass(closable: boolean): string {
  return `justify-start overflow-hidden whitespace-nowrap px-3 sm:justify-center sm:px-4${closable ? ' pr-11 sm:pr-11' : ''}`
}

/** Whether a plan change review is the proposal's own (its plan and period): only then does
 * Review quote and confirm through the proposal, with its concession. */
export function isProposalChange(
  p: Pick<PlanProposal, 'plan' | 'period'> | undefined,
  plan: string | undefined,
  period: string
): boolean {
  return !!p && p.plan.code === plan && p.period === period
}

/** The proposal id a console URL opens (?proposal=12), or undefined. */
export function proposalFromSearch(search: string): number | undefined {
  const v = new URLSearchParams(search).get('proposal')
  if (!v || !/^[1-9][0-9]{0,15}$/.test(v)) return undefined
  const id = Number(v)
  return Number.isSafeInteger(id) ? id : undefined
}
