import { type ServiceStorageStorageInner } from 'qovery-typescript-axios'
import {
  BlockContent,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacy,
  EmptyState,
  Heading,
  HelpSection,
  IconAwesomeEnum,
  InputText,
  Section,
} from '@qovery/shared/ui'

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
        <div className="flex justify-between mb-8">
          <div>
            <Heading className="mb-2">Storage</Heading>
            <p className="text-sm text-neutral-400">Add persistent local storage for your application.</p>
          </div>

          <ButtonLegacy onClick={() => props.onAddStorage()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add Storage
          </ButtonLegacy>
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
                <ButtonIcon
                  className="!bg-transparent hover:!bg-neutral-200 !w-[52px] !h-[52px]"
                  style={ButtonIconStyle.STROKED}
                  onClick={() => props.onEdit(storage)}
                  dataTestId="edit"
                  icon={IconAwesomeEnum.WHEEL}
                />
                <ButtonIcon
                  className="!bg-transparent hover:!bg-neutral-200 !w-[52px] !h-[52px]"
                  onClick={() => props.onRemove(storage)}
                  dataTestId="remove"
                  icon={IconAwesomeEnum.TRASH}
                  style={ButtonIconStyle.STROKED}
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
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#storage',
            linkLabel: 'How to configure my application',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsStorage
