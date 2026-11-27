/**
 * The selection rules of the discounts card, the server's (domain/discounts.go) and the ROI deal
 * builder's (deal.ts): a discount that needs another (paying a multi-year term up front) can only
 * be ticked once one of those is chosen or already granted; ticking one drops what it excludes
 * (two and three years); unticking drops what no longer has its requirement.
 */
type DiscountRule = { id: string; requires: string[]; excludes: string[] }

export function discountSelectable(
  d: DiscountRule,
  selected: string[],
  granted: string[] = [],
  types: readonly DiscountRule[] = []
): boolean {
  const conflictsWithContract =
    d.excludes.some((id) => granted.includes(id)) ||
    types.some((type) => granted.includes(type.id) && type.excludes.includes(d.id))
  return (
    !conflictsWithContract &&
    (d.requires.length === 0 || d.requires.some((r) => selected.includes(r) || granted.includes(r)))
  )
}

function pruneDiscounts(types: DiscountRule[], selected: string[], granted: string[]): string[] {
  let cur = selected
  for (;;) {
    const kept = cur.filter((id) => {
      const d = types.find((t) => t.id === id)
      return !!d && discountSelectable(d, cur, granted, types)
    })
    if (kept.length === cur.length) return kept
    cur = kept
  }
}

export function toggleDiscount(
  types: DiscountRule[],
  selected: string[],
  id: string,
  granted: string[] = []
): string[] {
  if (selected.includes(id))
    return pruneDiscounts(
      types,
      selected.filter((s) => s !== id),
      granted
    )
  const d = types.find((t) => t.id === id)
  if (!d || !discountSelectable(d, selected, granted, types)) return selected
  const dropped = new Set([...d.excludes, ...types.filter((t) => t.excludes.includes(id)).map((t) => t.id)])
  return pruneDiscounts(types, [...selected.filter((s) => !dropped.has(s)), id], granted)
}

/**
 * What a new request can still take off: the cap less the points already in the contract. Those
 * are not applied again (the contract price includes them) but they count toward the cap.
 */
export function discountRoom(max: number, contractPoints = 0): number {
  return Math.max(0, max - contractPoints)
}

/** The ids a request may never include: the discounts already in the contract. */
export function requestableDiscounts(selected: string[], inContract: { id: string }[] = []): string[] {
  return selected.filter((id) => !inContract.some((d) => d.id === id))
}

/** Points add up (no compounding); the customer gets at most `max`. */
export function discountPercent(
  types: { id: string; percent: number }[],
  selected: string[],
  max: number
): { points: number; percent: number; capped: boolean } {
  const points = Math.round(types.filter((t) => selected.includes(t.id)).reduce((a, t) => a + t.percent, 0) * 100) / 100
  return { points, percent: Math.min(points, max), capped: points > max }
}

/** The request the card shows: the one being reviewed, else the latest decided one (withdrawn ones are not shown). */
export function currentDiscountRequest<T extends { status: string; requested_at: string; decided_at?: string | null }>(
  requests: T[]
): T | undefined {
  const order = (r: T) => Date.parse(r.decided_at ?? r.requested_at)
  const recent = requests.filter((r) => r.status !== 'withdrawn').sort((a, b) => order(b) - order(a))
  return recent.find((r) => r.status === 'open') ?? recent[0]
}

/**
 * The most the levers on offer can add up to, for the collapsed card's hint ("Up to 35% off"):
 * the largest lever of each group that excludes the others, then only the levers whose
 * requirement is met, capped at `max`.
 */
export function discountsUpTo(
  types: (DiscountRule & { percent: number })[],
  max: number,
  granted: string[] = []
): number {
  let chosen: string[] = []
  for (const t of [...types].sort((a, b) => b.percent - a.percent)) {
    const clash = chosen.some(
      (id) => t.excludes.includes(id) || types.find((x) => x.id === id)?.excludes.includes(t.id)
    )
    if (!clash && !granted.some((g) => t.excludes.includes(g))) chosen.push(t.id)
  }
  chosen = pruneDiscounts(types, chosen, granted)
  return discountPercent(types, chosen, max).percent
}

/**
 * Whether the discounts card shows its levers, price and request form. Collapsed by default;
 * opened (or closed) by the person; open by itself once a lever is ticked, or when there is a
 * request to show (under review, approved or declined).
 */
export function discountsExpanded(p: {
  opened?: boolean
  selected: string[]
  requests: { status: string }[]
}): boolean {
  return p.opened ?? (p.selected.length > 0 || p.requests.some((r) => r.status !== 'withdrawn'))
}
