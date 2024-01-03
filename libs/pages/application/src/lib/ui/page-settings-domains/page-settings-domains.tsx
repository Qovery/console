import { type CustomDomain } from 'qovery-typescript-axios'
import {
  BlockContent,
  Button,
  EmptyState,
  Heading,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputText,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'

export interface PageSettingsDomainsProps {
  onAddDomain: () => void
  onEdit: (customDomain: CustomDomain) => void
  onDelete: (customDomain: CustomDomain) => void
  domains?: CustomDomain[]
  loading?: boolean
}

export function PageSettingsDomains(props: PageSettingsDomainsProps) {
  return (
    <Section className="justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <Heading className="mb-2">Domain</Heading>
            <p className="text-sm text-neutral-400 mb-2">Add custom domains to your service.</p>
          </div>

          <Button size="lg" variant="solid" color="brand" onClick={() => props.onAddDomain()}>
            Add Domain
            <Icon name={IconAwesomeEnum.CIRCLE_PLUS} className="ml-2" />
          </Button>
        </div>

        {props.loading && props.domains?.length === 0 ? (
          <div className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : props.domains && props.domains.length > 0 ? (
          <BlockContent title="Configured domains">
            {props.domains &&
              props.domains.map((customDomain, i) => (
                <div
                  key={`domain-${customDomain.domain}-${customDomain.id}`}
                  className={`flex justify-between w-full items-center gap-3 ${
                    props.domains && props.domains.length !== i + 1 ? 'mb-5' : ''
                  }`}
                  data-testid="form-row"
                >
                  <InputText
                    name={`domain-${customDomain.domain}-${customDomain.id}`}
                    className="shrink-0 grow flex-1"
                    value={customDomain.domain}
                    label="Default Domain"
                    disabled
                  />
                  <Button
                    data-testid="edit-button"
                    variant="outline"
                    color="neutral"
                    size="lg"
                    className="justify-center w-[52px] h-[52px]"
                    onClick={() => props.onEdit(customDomain)}
                  >
                    <Icon name={IconAwesomeEnum.WHEEL} />
                  </Button>
                  <Button
                    data-testid="delete-button"
                    variant="outline"
                    color="neutral"
                    size="lg"
                    className="justify-center w-[52px] h-[52px]"
                    onClick={() => props.onDelete(customDomain)}
                  >
                    <Icon name={IconAwesomeEnum.TRASH} />
                  </Button>
                </div>
              ))}
          </BlockContent>
        ) : (
          <EmptyState title="No domains are set" description="Define a custom domain for your application" />
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#domains',
            linkLabel: 'How to configure my application',
          },
        ]}
      />
    </Section>
  )
}

export default PageSettingsDomains
