import { Button, ButtonIcon, HelpSection, IconAwesomeEnum, InputSelect, InputText } from '@console/shared/ui'
import { Controller, useFormContext } from 'react-hook-form'
import { StorageTypeEnum } from 'qovery-typescript-axios'

export interface PageSettingsDomainsProps {
  keys: string[]
  onAddStorage: () => void
  onRemove: (key: string) => void
}

export function PageSettingsDomains(props: PageSettingsDomainsProps) {
  const { control } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div>
        <p>Add persistent local storage for your application.</p>
        <Button onClick={() => props.onAddStorage()} iconRight={IconAwesomeEnum.PLUS}>
          Add Storage
        </Button>
      </div>
      {props.keys?.length > 0 ? (
        props.keys.map((key, i) => (
          <div key={key} className="flex flex-col justify-between w-full" data-testid="form-row">
            <Controller
              name={'size_' + key}
              control={control}
              rules={{
                required: 'Please enter a value.',
                max: {
                  value: 512,
                  message: 'The hard disk space must be between 32 and 512 GB.',
                },
                min: {
                  value: 32,
                  message: 'The hard disk space must be between 32 and 512 GB.',
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="shrink-0 grow flex-1 mr-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  label="Size in GB"
                />
              )}
            />

            <Controller
              name={'path_' + key}
              control={control}
              rules={{
                required: 'Please enter a value.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="shrink-0 grow flex-1 mr-3"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  label="Path"
                />
              )}
            />

            <Controller
              name={'type_' + key}
              control={control}
              rules={{
                required: 'Please enter a value.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  className="shrink-0 grow flex-1 mr-3"
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  items={Object.values(StorageTypeEnum).map((s) => ({ value: s, label: s }))}
                  label="Type"
                />
              )}
            />

            <ButtonIcon onClick={() => props.onRemove(key)} dataTestId="remove" icon={IconAwesomeEnum.TRASH} />
          </div>
        ))
      ) : (
        <div>
          <h3>No storage are set</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi assumenda deserunt dolorem et facere
            inventore ipsam iure labore nisi praesentium quaerat quidem quisquam recusandae reprehenderit rerum, sunt
            suscipit unde vero.
          </p>
        </div>
      )}

      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#delete-an-application',
            linkLabel: 'How to delete my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDomains
