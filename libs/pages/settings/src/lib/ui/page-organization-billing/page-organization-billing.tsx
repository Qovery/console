/* eslint-disable-next-line */
import { Button, HelpSection, IconAwesomeEnum } from '@qovery/shared/ui'

export interface PageOrganizationBillingProps {}

export function PageOrganizationBilling(props: PageOrganizationBillingProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Payment method</h1>
          </div>
          <Button iconRight={IconAwesomeEnum.CIRCLE_PLUS}>Add new card</Button>
        </div>
      </div>
      <HelpSection
        data-testid="help-section"
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members',
            linkLabel: 'How to configure my organization members',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationBilling
