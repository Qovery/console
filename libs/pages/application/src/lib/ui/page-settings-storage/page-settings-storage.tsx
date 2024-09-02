import { type ServiceStorageStorageInner, type StateEnum } from 'qovery-typescript-axios'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, EmptyState, Icon, InputText, Section, Tooltip } from '@qovery/shared/ui'

export interface PageSettingsStorageProps {
  storages: ServiceStorageStorageInner[]
  deploymentState: StateEnum
  onAddStorage: () => void
  onRemove: (storage: ServiceStorageStorageInner) => void
  onEdit: (storage: ServiceStorageStorageInner) => void
}

export function PageSettingsStorage(props: PageSettingsStorageProps) {
  const disableAdd = props.deploymentState !== 'READY'

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Storage" description="Add persistent local storage for your application.">
          <Tooltip
            disabled={!disableAdd}
            content="Storage can be added only to services that have never been deployed before"
          >
            <Button className="gap-2" size="md" onClick={() => props.onAddStorage()} disabled={disableAdd}>
              Add Storage
              <Icon iconName="plus-circle" iconStyle="regular" />
            </Button>
          </Tooltip>
        </SettingsHeading>

        {props.storages?.length > 0 ? (
          <BlockContent title="Storage">
            {props.storages.map((storage, i) => (
              <div
                key={storage.id}
                className={`flex w-full items-center justify-between gap-3 ${
                  props.storages.length !== i + 1 ? 'mb-5' : ''
                }`}
                data-testid="form-row"
              >
                <InputText
                  name={'size_' + storage.id}
                  className="flex-1 shrink-0 grow"
                  value={storage.size.toString()}
                  label="Size in GiB"
                  disabled
                />

                <InputText
                  name={'path_' + storage.id}
                  className="flex-1 shrink-0 grow"
                  value={storage.mount_point}
                  label="Path"
                  disabled
                />
                <InputText
                  name={'type_' + storage.id}
                  className="flex-1 shrink-0 grow"
                  value={storage.type}
                  label="Type"
                  disabled
                />
                <Button
                  data-testid="edit"
                  className="h-[52px] w-[52px] justify-center"
                  variant="surface"
                  color="neutral"
                  onClick={() => props.onEdit(storage)}
                >
                  <Icon iconName="gear" className="text-sm" />
                </Button>
                <Button
                  data-testid="remove"
                  className="h-[52px] w-[52px] justify-center"
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
