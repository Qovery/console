import { type ServiceStorageStorageInner } from 'qovery-typescript-axios'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, EmptyState, Icon, InputText, Section } from '@qovery/shared/ui'

export interface PageSettingsStorageProps {
  storages: ServiceStorageStorageInner[]
  onAddStorage: () => void
  onRemove: (storage: ServiceStorageStorageInner) => void
  onEdit: (storage: ServiceStorageStorageInner) => void
}

export function PageSettingsStorage(props: PageSettingsStorageProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <SettingsHeading title="Storage" description="Add persistent local storage for your application.">
          <Button className="gap-2" size="lg" onClick={() => props.onAddStorage()}>
            Add Storage
            <Icon iconName="plus-circle" />
          </Button>
        </SettingsHeading>

        {props.storages?.length > 0 ? (
          <BlockContent title="Storage">
            {props.storages.map((storage, i) => (
              <div
                key={storage.id}
                className={`flex justify-between w-full items-center gap-3 ${
                  props.storages.length !== i + 1 ? 'mb-5' : ''
                }`}
                data-testid="form-row"
              >
                <InputText
                  name={'size_' + storage.id}
                  className="shrink-0 grow flex-1"
                  value={storage.size.toString()}
                  label="Size in GiB"
                  disabled
                />

                <InputText
                  name={'path_' + storage.id}
                  className="shrink-0 grow flex-1"
                  value={storage.mount_point}
                  label="Path"
                  disabled
                />
                <InputText
                  name={'type_' + storage.id}
                  className="shrink-0 grow flex-1"
                  value={storage.type}
                  label="Type"
                  disabled
                />
                <Button
                  data-testid="edit"
                  className="w-[52px] h-[52px] justify-center"
                  variant="surface"
                  color="neutral"
                  onClick={() => props.onEdit(storage)}
                >
                  <Icon iconName="gear" className="text-sm" />
                </Button>
                <Button
                  data-testid="remove"
                  className="w-[52px] h-[52px] justify-center"
                  variant="surface"
                  color="neutral"
                  onClick={() => props.onRemove(storage)}
                >
                  <Icon iconName="trash" className="text-sm" />
                </Button>
              </div>
            ))}
          </BlockContent>
        ) : (
          <EmptyState
            title="No storage are set"
            description="Qovery applications can use storage to store data that persists across deploys and restarts, making it easy to deploy stateful applications"
          />
        )}
      </Section>
    </div>
  )
}

export default PageSettingsStorage
