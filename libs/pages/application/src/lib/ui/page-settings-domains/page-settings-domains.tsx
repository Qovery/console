import { CustomDomain } from 'qovery-typescript-axios'
import { ApplicationEntity } from '@console/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  HelpSection,
  IconAwesomeEnum,
  InputText,
  PlaceholderSettings,
} from '@console/shared/ui'
import { InputApprovalBadge } from './input-approval-badge/input-approval-badge'

export interface PageSettingsDomainsProps {
  application?: ApplicationEntity
  onAddDomain: () => void
  onEdit: (customDomain: CustomDomain) => void
  onDelete: (customDomain: CustomDomain) => void
  domains?: CustomDomain[]
}

export function PageSettingsDomains(props: PageSettingsDomainsProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-max-width-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Domain</h1>
            <p className="text-sm text-text-500">Add custom domains to your application.</p>
          </div>

          <Button onClick={() => props.onAddDomain()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add Domain
          </Button>
        </div>

        {props.domains && props.domains.length > 0 ? (
          <BlockContent title="Configured domains">
            {props.domains &&
              props.domains.map((customDomain, i) => (
                <div
                  key={i}
                  className={`flex justify-between w-full items-center gap-3 ${
                    props.domains && props.domains.length !== i + 1 ? 'mb-5' : ''
                  }`}
                  data-testid="form-row"
                >
                  <InputText
                    name={'link_' + i}
                    className="shrink-0 grow flex-1"
                    value={customDomain.domain}
                    label="Default Domain"
                    disabled
                    rightFloatingComponent={<InputApprovalBadge status={customDomain.status} />}
                  />

                  <ButtonIcon
                    iconClassName="text-text-500 hover:text-text-700"
                    onClick={() => props.onDelete(customDomain)}
                    dataTestId="delete-button"
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.FLAT}
                  />
                  <ButtonIcon
                    iconClassName="text-text-500 hover:text-text-700"
                    style={ButtonIconStyle.FLAT}
                    onClick={() => props.onEdit(customDomain)}
                    dataTestId="edit-button"
                    icon={IconAwesomeEnum.PEN}
                  />
                </div>
              ))}
          </BlockContent>
        ) : (
          <PlaceholderSettings title="No domains are set" description="Define a custom domain for your application" />
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#domains',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDomains
