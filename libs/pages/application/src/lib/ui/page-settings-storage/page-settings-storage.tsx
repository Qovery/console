import { ServiceStorageStorage } from 'qovery-typescript-axios'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  InputText,
} from '@qovery/shared/ui'

export interface PageSettingsStorageProps {
  storages: ServiceStorageStorage[]
  onAddStorage: () => void
  onRemove: (storage: ServiceStorageStorage) => void
  onEdit: (storage: ServiceStorageStorage) => void
}

export function PageSettingsStorage(props: PageSettingsStorageProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Storage</h1>
            <p className="text-sm text-text-500">Add persistent local storage for your application.</p>
          </div>

          <Button onClick={() => props.onAddStorage()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add Storage
          </Button>
        </div>

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
                  label="Size in GB"
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
                <ButtonIcon
                  className="text-text-500"
                  style={ButtonIconStyle.FLAT}
                  onClick={() => props.onEdit(storage)}
                  dataTestId="edit"
                  icon={IconAwesomeEnum.WHEEL}
                />
                <ButtonIcon
                  className="text-text-500"
                  onClick={() => props.onRemove(storage)}
                  dataTestId="remove"
                  icon={IconAwesomeEnum.TRASH}
                  style={ButtonIconStyle.FLAT}
                />
              </div>
            ))}
          </BlockContent>
        ) : (
          <EmptyState
            title="No storage are set"
            description="Qovery applications can use storage to store data that persists across deploys and restarts, making it easy to deploy stateful applications"
          />
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#storage',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsStorage
