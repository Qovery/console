import { ApplicationStorageStorage } from 'qovery-typescript-axios'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  HelpSection,
  IconAwesomeEnum,
  InputText,
} from '@console/shared/ui'

export interface PageSettingsStorageProps {
  storages: ApplicationStorageStorage[]
  onAddStorage: () => void
  onRemove: (storage: ApplicationStorageStorage) => void
  onEdit: (storage: ApplicationStorageStorage) => void
}

export function PageSettingsStorage(props: PageSettingsStorageProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-max-width-content-with-navigation-left">
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
                className="flex justify-between w-full items-center gap-3 mb-5"
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
                  iconClassName="text-text-500 hover:text-text-700"
                  onClick={() => props.onRemove(storage)}
                  dataTestId="remove"
                  icon={IconAwesomeEnum.TRASH}
                  style={ButtonIconStyle.FLAT}
                />
                <ButtonIcon
                  iconClassName="text-text-500 hover:text-text-700"
                  style={ButtonIconStyle.FLAT}
                  onClick={() => props.onEdit(storage)}
                  dataTestId="edit"
                  icon={IconAwesomeEnum.PEN}
                />
              </div>
            ))}
          </BlockContent>
        ) : (
          <div className="text-center flex flex-col items-center justify-center w-[420px] m-auto mt-10">
            <img
              className="w-[48px] pointer-events-none user-none mb-5"
              src="/assets/images/event-placeholder-light.svg"
              alt="Event placeholder"
            />
            <p className="text-text-600 font-medium mb-1">No storage are set</p>
            <p className="text-sm text-text-400">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi assumenda deserunt dolorem et facere
              inventore ipsam iure labore nisi praesentium quaerat quidem quisquam recusandae reprehenderit rerum, sunt
              suscipit unde vero.
            </p>
          </div>
        )}
      </div>
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

export default PageSettingsStorage
