import { clsx } from 'clsx'
import { useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Icon, InputSearch, Popover, Tooltip } from '@qovery/shared/ui'
import { ServiceAvatar } from '../service-avatar/service-avatar'
import { type IconURI, ServiceIcons } from '../service-icon/service-icon'
import { ServiceTemplateIndicator } from '../service-template-indicator/service-template-indicator'

const icons = (Object.keys(ServiceIcons) as Array<IconURI>).map((iconUri) => ({
  uri: iconUri,
  ...ServiceIcons[iconUri],
}))

export interface ServiceAvatarSwitcherProps {
  onChange: (newUri: IconURI) => void
  service: AnyService
}

export function ServiceAvatarSwitcher({ onChange, service }: ServiceAvatarSwitcherProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const handleClick = (newUri: IconURI) => {
    onChange(newUri)
  }
  const filteredIcons = icons.filter(({ title }) =>
    searchTerm ? title.toLowerCase().includes(searchTerm.toLowerCase()) : true
  )

  return (
    <Popover.Root>
      <Popover.Trigger>
        <button className="relative rounded-full transition hover:bg-neutral-100" type="button">
          <ServiceTemplateIndicator service={service} size="md">
            <ServiceAvatar service={service} border="solid" size="md" />
          </ServiceTemplateIndicator>
          <Icon
            iconName="angle-down"
            className="absolute bottom-0 right-0 rounded-full bg-white p-0.5 text-neutral-300"
          />
        </button>
      </Popover.Trigger>
      <Popover.Content side="bottom" className="flex flex-col gap-2" style={{ width: 400 }}>
        <span className="text-sm text-neutral-350">Change icon</span>
        <InputSearch placeholder="Search..." className="mb-1" onChange={(value) => setSearchTerm(value)} autofocus />
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-8 gap-2 text-sm text-neutral-350">
            {filteredIcons.map(({ icon, title, uri }) => {
              const isSelected = uri === service.icon_uri
              // XXX: corner case as application and container have the same icon, we want to hide one of them.
              if (uri === 'app://qovery-console/container') {
                return null
              }
              return (
                <Popover.Close key={title}>
                  <Tooltip content={title}>
                    <img
                      className={clsx(
                        'h-[38px] max-h-[38px] w-[38px] max-w-[38px] cursor-pointer select-none rounded border p-2',
                        isSelected && 'border-brand-500 bg-brand-50',
                        !isSelected && 'border-neutral-250 transition hover:border-neutral-300'
                      )}
                      width="100%"
                      height="100%"
                      src={icon}
                      alt={title}
                      onClick={() => handleClick(uri)}
                    />
                  </Tooltip>
                </Popover.Close>
              )
            })}
          </div>
        ) : (
          <div className="px-3 py-6 text-center text-neutral-350">
            <Icon iconName="wave-pulse" />
            <p className="mt-1 text-xs font-medium">No result for this search</p>
          </div>
        )}
      </Popover.Content>
    </Popover.Root>
  )
}

export default ServiceAvatarSwitcher
