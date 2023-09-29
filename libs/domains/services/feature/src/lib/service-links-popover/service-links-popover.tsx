import { type Link } from 'qovery-typescript-axios'
import {
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  CopyToClipboard,
  IconAwesomeEnum,
  Popover,
  Skeleton,
  Truncate,
} from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'

export interface ServiceLinksPopoverProps {
  links?: Link[]
}

// TODO: Update props and using React Query
export function ServiceLinksPopover({ links }: ServiceLinksPopoverProps) {
  if (!links) {
    return <Skeleton height={40} width={110} />
  }
  return (
    <Popover.Root>
      <Popover.Trigger hidden={links.length === 0}>
        <div>
          <ButtonLegacy
            style={ButtonLegacyStyle.STROKED}
            size={ButtonLegacySize.LARGE}
            iconLeft={IconAwesomeEnum.ANGLE_DOWN}
            iconRight={IconAwesomeEnum.LINK}
          >
            Links
          </ButtonLegacy>
        </div>
      </Popover.Trigger>
      <Popover.Content
        side="bottom"
        className="p-2 text-neutral-350 text-sm border-transparent max-w-[280px]"
        align="end"
      >
        <div className="p-2 flex justify-between items-center">
          <p className="text-neutral-350 font-medium">
            {links?.length ?? 0} {pluralize(links?.length ?? 0, 'link')} attached
          </p>
        </div>
        <ul>
          {links.map((link: Link) => (
            <li key={link.url} className="flex p-2">
              <CopyToClipboard className="text-brand-500 hover:text-brand-600 mr-2" content={link.url ?? ''} />
              <a
                className="transition flex items-center justify-between w-full text-neutral-400 hover:text-brand-500"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="text-ssm font-medium mr-2">
                  <Truncate text={link.url ?? ''} truncateLimit={28} />
                </div>
                <div className="text-xs text-neutral-350">{link.internal_port}</div>
              </a>
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover.Root>
  )
}

export default ServiceLinksPopover
