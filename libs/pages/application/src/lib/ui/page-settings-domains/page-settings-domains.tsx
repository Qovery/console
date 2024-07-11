import { type CustomDomain } from 'qovery-typescript-axios'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, EmptyState, Icon, InputText, LoaderSpinner, Section } from '@qovery/shared/ui'

export interface PageSettingsDomainsProps {
  onAddDomain: () => void
  onEdit: (customDomain: CustomDomain) => void
  onDelete: (customDomain: CustomDomain) => void
  domains?: CustomDomain[]
  loading?: boolean
}

export function PageSettingsDomains(props: PageSettingsDomainsProps) {
  return (
    <div className="w-full justify-between">
      <Section className="max-w-content-with-navigation-left  p-8">
        <SettingsHeading title="Domain" description="Add custom domains to your service.">
          <Button size="lg" variant="solid" color="brand" onClick={() => props.onAddDomain()}>
            Add Domain
            <Icon iconName="circle-plus" className="ml-2" />
          </Button>
        </SettingsHeading>
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
                  className={`flex w-full items-center justify-between gap-3 ${
                    props.domains && props.domains.length !== i + 1 ? 'mb-5' : ''
                  }`}
                  data-testid="form-row"
                >
                  <InputText
                    name={`domain-${customDomain.domain}-${customDomain.id}`}
                    className="flex-1 shrink-0 grow"
                    value={customDomain.domain}
                    label="Default Domain"
                    disabled
                  />
                  <Button
                    data-testid="edit-button"
                    variant="surface"
                    color="neutral"
                    size="lg"
                    className="h-[52px] w-[52px] justify-center"
                    onClick={() => props.onEdit(customDomain)}
                  >
                    <Icon iconName="gear" />
                  </Button>
                  <Button
                    data-testid="delete-button"
                    variant="surface"
                    color="neutral"
                    size="lg"
                    className="h-[52px] w-[52px] justify-center"
                    onClick={() => props.onDelete(customDomain)}
                  >
                    <Icon iconName="trash" />
                  </Button>
                </div>
              ))}
          </BlockContent>
        ) : (
          <EmptyState title="No domains are set" description="Define a custom domain for your application" />
        )}
      </Section>
    </div>
  )
}

export default PageSettingsDomains
