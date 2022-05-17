/* eslint-disable-next-line */
import { BaseLink, Link } from '../link/link'

export interface HelpSectionProps {
  description: string
  links?: BaseLink[]
}

export function HelpSection(props: HelpSectionProps) {
  const { description, links } = props
  return (
    <div className="py-8 px-10 border-t border-element-light-lighter-400">
      <p className="text-text-500 text-sm mb-5">{description}</p>
      {links &&
        links.map((link, i, row) => (
          <Link
            className={i + 1 === row.length ? '' : 'mb-2'}
            link={link.link}
            linkLabel={link.linkLabel || link.link}
            external={link.external}
            iconRight="icon-solid-arrow-up-right-from-square"
          ></Link>
        ))}
    </div>
  )
}

export default HelpSection
