import { NavLink } from 'react-router-dom'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { type BaseLink, Link } from '../link/link'

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
      {
        links &&
          links.map((link, i, row) =>
            link.external ? (
              <Link key={i} color="sky" className={`block ${i + 1 === row.length ? '' : 'mb-2'}`}>
                <a href={link.link} target="_blank" rel="noopener noreferrer">
                  {link.linkLabel || link.link}
                  <Icon name={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE} />
                </a>
              </Link>
            ) : (
              <Link key={i} color="sky" className={`block ${i + 1 === row.length ? '' : 'mb-2'}`}>
                <NavLink to={link.link}>
                  {link.linkLabel || link.link} <Icon name={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE} />
                </NavLink>
              </Link>
            )
          )
        // <Link
        //   key={i}
        //   className={i + 1 === row.length ? '' : 'mb-2'}
        //   link={link.link}
        //   linkLabel={link.linkLabel || link.link}
        //   external={link.external}
        //   iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
        // />
      }
    </div>
  )
}

export default HelpSection
