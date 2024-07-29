import { clsx } from 'clsx'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Icon, Popover } from '@qovery/shared/ui'
import { ServiceAvatar } from '../service-avatar/service-avatar'
import { type IconURI, ServiceIcons } from '../service-avatar/service-icon'
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
  const handleClick = (newUri: IconURI) => {
    onChange(newUri)
  }

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
      <Popover.Content side="bottom" className="grid grid-cols-8 gap-2 text-sm text-neutral-350" style={{ width: 400 }}>
        {icons.map(({ icon, title, uri }) => {
          const isSelected = uri === service.icon_uri
          return (
            <Popover.Close key={title}>
              <img
                className={clsx(
                  'max-h-[38px] max-w-[38px] cursor-pointer select-none rounded border p-2',
                  isSelected && 'border-brand-500 bg-brand-50',
                  !isSelected && 'border-neutral-250 transition hover:border-neutral-300'
                )}
                width="100%"
                height="100%"
                src={icon}
                alt={title}
                onClick={() => handleClick(uri)}
              />
            </Popover.Close>
          )
        })}
      </Popover.Content>
    </Popover.Root>
  )
}

export default ServiceAvatarSwitcher
