import { twMerge } from '@qovery/shared/util-js'
import { ExternalLink } from '../link/link'

export interface BaseLink {
  link: string
  linkLabel?: string
}

export interface HelpSectionProps {
  description: string
  links?: BaseLink[]
  className?: string
}

export function HelpSection({ description, links, className }: HelpSectionProps) {
  return (
    <div data-testid="help-section" className={twMerge('py-8 px-10 border-t border-neutral-200', className)}>
      <p className="text-neutral-400 text-sm mb-5">{description}</p>
      <div className="flex flex-col gap-2">
        {links &&
          links.map((link, i) => (
            <ExternalLink key={i} color="sky" href={link.link} className="flex">
              {link.linkLabel || link.link}
            </ExternalLink>
          ))}
      </div>
    </div>
  )
}

export default HelpSection
