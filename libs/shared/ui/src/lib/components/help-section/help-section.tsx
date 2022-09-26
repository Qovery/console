import { BaseLink, Link } from '../link/link'

export interface HelpSectionProps {
  description: string
  links?: BaseLink[]
  className?: string
}

export function HelpSection(props: HelpSectionProps) {
  const { description, links, className = '' } = props

  return (
    <div data-testid="help-section" className={`py-8 px-10 border-t border-element-light-lighter-400 ${className}`}>
      <p className="text-text-500 text-sm mb-5">{description}</p>
      {links &&
        links.map((link, i, row) => (
          <Link
            key={i}
            className={`font-medium ${i + 1 === row.length ? '' : 'mb-2'}`}
            link={link.link}
            linkLabel={link.linkLabel || link.link}
            external={link.external}
            iconRight="icon-solid-arrow-up-right-from-square"
          />
        ))}
    </div>
  )
}

export default HelpSection
