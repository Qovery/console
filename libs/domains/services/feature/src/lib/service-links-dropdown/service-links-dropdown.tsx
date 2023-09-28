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

export interface ServiceLinksDropdownProps {
  links?: Link[]
}

// TODO: Update props and using React Query
export function ServiceLinksDropdown({ links }: ServiceLinksDropdownProps) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <div>
          <Skeleton height={40} width={110} show={!links}>
            <ButtonLegacy
              style={ButtonLegacyStyle.STROKED}
              size={ButtonLegacySize.LARGE}
              iconLeft={IconAwesomeEnum.ANGLE_DOWN}
              iconRight={IconAwesomeEnum.LINK}
            >
              Links
            </ButtonLegacy>
          </Skeleton>
        </div>
      </Popover.Trigger>
      <Popover.Content
        side="bottom"
        className="p-2 text-neutral-350 text-sm relative right-4 border-transparent"
        style={{ width: 280 }}
      >
        <div className="p-2 flex justify-between items-center">
          <h6 className="text-neutral-350 font-medium">
            {links?.length ?? 0} {pluralize('link', links?.length)} attached
          </h6>
        </div>
        <ul>
          {links?.map((link: Link) => (
            <li key={link.url} className="flex p-2">
              <CopyToClipboard className="text-brand-500 hover:text-brand-600 mr-2" content={link.url ?? ''} />
              <a
                className="transition flex items-center justify-between w-full text-neutral-400 hover:text-brand-500"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="block text-ssm font-medium mr-2">
                  <Truncate text={link.url ?? ''} truncateLimit={28} />
                </span>
                <span className="block text-xs text-neutral-350">{link.internal_port}</span>
              </a>
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover.Root>
  )
}

export default ServiceLinksDropdown
