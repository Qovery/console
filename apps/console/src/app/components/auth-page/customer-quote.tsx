export interface CustomerQuoteProps {
  quote?: string
  authorName: string
  authorRole: string
  companyName: string
  logoSrc: string
}

// Not rendered until a real, approved customer quote is provided
export const SIGNUP_CUSTOMER_QUOTE: CustomerQuoteProps | undefined = undefined

export function CustomerQuote({ quote, authorName, authorRole, companyName, logoSrc }: CustomerQuoteProps) {
  if (!quote) {
    return null
  }

  return (
    <figure className="flex max-w-md flex-col gap-4 rounded-2xl border border-neutral bg-background p-6 shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)]">
      <blockquote className="font-brand text-lg leading-7 text-neutral">“{quote}”</blockquote>
      <figcaption className="flex items-center gap-3">
        <img src={logoSrc} alt={`${companyName} logo`} className="h-8 w-8 rounded-md object-contain" />
        <span className="flex flex-col text-sm">
          <span className="font-medium text-neutral">{authorName}</span>
          <span className="text-neutral-subtle">
            {authorRole}, {companyName}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}
