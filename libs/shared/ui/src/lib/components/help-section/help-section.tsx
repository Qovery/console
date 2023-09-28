import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { type BaseLink, ExternalLink, Link } from '../link/link'

export interface HelpSectionProps {
  description: string
  links?: BaseLink[]
  className?: string
}

export function HelpSection(props: HelpSectionProps) {
  const { description, links, className = '' } = props

  return (
    <div data-testid="help-section" className={`py-8 px-10 border-t border-neutral-200 ${className}`}>
      <p className="text-neutral-400 text-sm mb-5">{description}</p>
      {links &&
        links.map((link, i, row) =>
          link.external ? (
            <ExternalLink key={i} color="sky" className={`flex ${i + 1 === row.length ? '' : 'mb-2'}`}>
              {link.linkLabel || link.link}
            </ExternalLink>
          ) : (
            <Link
              key={i}
              color="sky"
              to={link.link}
              icon={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
              className={`flex ${i + 1 === row.length ? '' : 'mb-2'}`}
            >
              {link.linkLabel || link.link}
            </Link>
          )
        )}
    </div>
  )
}

export default HelpSection
