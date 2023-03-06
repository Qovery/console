import { Button, ButtonStyle, HelpSection } from '@qovery/shared/ui'

export interface PageOrganizationBillingSummaryProps {}

export function PageOrganizationBillingSummary(props: PageOrganizationBillingSummaryProps) {
  return (
    <div className="flex flex-col justify-between w-full max-w-content-with-navigation-left">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Plan details</h1>
          </div>
          <div className="flex gap-3">
            <Button style={ButtonStyle.STROKED} dataTestId="add-new-card-button">
              Promo code
            </Button>
            <Button dataTestId="add-new-card-button">Upgrade plan</Button>
          </div>
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

export default PageOrganizationBillingSummary
