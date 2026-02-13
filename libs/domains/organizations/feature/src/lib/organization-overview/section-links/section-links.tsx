import { type IconName } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

const LINKS: {
  title: string
  url: string
  color: string
  icon: IconName
}[] = [
  {
    title: 'Documentation',
    url: 'https://www.qovery.com/docs',
    color: 'blue',
    icon: 'book',
  },
  {
    title: 'Support',
    url: 'https://www.qovery.com/support',
    color: 'yellow',
    icon: 'robot',
  },
  {
    title: 'Give feedback',
    url: 'https://www.qovery.com/feedback',
    color: 'red',
    icon: 'message',
  },
]

export function SectionLinks() {
  return (
    <Section className="flex flex-col gap-3">
      <Heading className="flex items-center gap-2">
        <Icon iconName="link" className="text-sm text-neutral-subtle" />
        Useful links
      </Heading>
      {LINKS.map((link) => (
        <a
          key={link.url}
          href={link.url}
          title={link.title}
          target="_blank"
          rel="noreferrer"
          className="group flex justify-between gap-2 rounded-lg border border-neutral p-4 text-sm text-neutral transition-colors hover:bg-surface-neutral-subtle"
        >
          <p className="flex items-center gap-3">
            <span
              className={twMerge(
                clsx('flex h-7 w-7 min-w-7 items-center justify-center rounded', {
                  'bg-surface-info-component text-info': link.color === 'blue',
                  'bg-surface-warning-component text-warning': link.color === 'yellow',
                  'bg-surface-accent1-component text-accent1': link.color === 'red',
                })
              )}
            >
              <Icon iconName={link.icon} className="text-sm" />
            </span>
            <span>{link.title}</span>
          </p>
          <Icon
            iconName="angle-right"
            className="text-base text-neutral-subtle transition-colors group-hover:text-neutral"
          />
        </a>
      ))}
    </Section>
  )
}

export default SectionLinks
