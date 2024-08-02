import { Controller, useFormContext } from 'react-hook-form'
import { type AnyService } from '@qovery/domains/services/data-access'
import { InputText, InputTextArea } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { ServiceAvatarSwitcher } from '../service-avatar-switcher/service-avatar-switcher'

export interface GeneralSettingProps {
  label?: string
  service?: AnyService
}

export function GeneralSetting({ label = 'Name', service }: GeneralSettingProps) {
  const { control } = useFormContext()

  return (
    <>
      <div className="flex items-center gap-4">
        <Controller
          name="icon_uri"
          control={control}
          render={({ field }) =>
            service ? (
              <ServiceAvatarSwitcher service={{ ...service, icon_uri: field.value }} onChange={field.onChange} />
            ) : (
              <></>
            )
          }
        />
        <div className="grow">
          <Controller
            name="name"
            control={control}
            rules={{
              required: 'Please enter a name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label={label}
                error={error?.message}
              />
            )}
          />
        </div>
      </div>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <InputTextArea
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description (optional)"
          />
        )}
      />
      <Controller
        name="template_type"
        control={control}
        render={({ field }) =>
          field.value && (
            <InputText
              name={field.name}
              onChange={field.onChange}
              value={upperCaseFirstLetter(field.value)}
              label="Type"
              disabled
            />
          )
        }
      />
    </>
  )
}

export default GeneralSetting
