import { type CreditCard } from 'qovery-typescript-axios'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  Heading,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputCreditCard,
  InputText,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import BillingDetailsFeature from '../../feature/page-organization-billing-feature/billing-details-feature/billing-details-feature'

export interface PageOrganizationBillingProps {
  creditCards: CreditCard[]
  openNewCreditCardModal: () => void
  onDeleteCard: (creditCard: CreditCard) => void
  creditCardLoading?: boolean
}

export function PageOrganizationBilling(props: PageOrganizationBillingProps) {
  return (
    <div className="flex flex-col justify-between w-full max-w-content-with-navigation-left">
      <Section className="p-8">
        <div className="flex justify-between mb-8">
          <Heading className="mb-2">Payment method</Heading>
          <Button onClick={props.openNewCreditCardModal} size="lg" className="gap-2" data-testid="add-new-card-button">
            Add new card
            <Icon iconName="circle-plus" />
          </Button>
        </div>

        <BlockContent title="Credit cards">
          {props.creditCardLoading && props.creditCards.length === 0 ? (
            <div className="flex justify-center">
              <LoaderSpinner />
            </div>
          ) : props.creditCards.length > 0 ? (
            <div className="flex flex-col">
              <p className="text-xs text-neutral-400 mb-5">
                You will be charged in USD / EUR - contact us for more details.
              </p>
              {props.creditCards.map((creditCard) => (
                <div
                  data-testid="credit-card-row"
                  key={creditCard.id}
                  className="flex items-center justify-between mb-3 gap-3"
                >
                  <InputCreditCard
                    type="number"
                    name="Card number"
                    label="Card number"
                    brand={creditCard.brand?.toLowerCase()}
                    value={`**** ${creditCard.last_digit}`}
                    disabled
                    className="grow"
                  />
                  <InputText
                    name="Expiration date"
                    label="Expiration date"
                    className="grow"
                    value={`${creditCard.expiry_month} / ${creditCard.expiry_year}`}
                    disabled
                  />
                  <ButtonIcon
                    dataTestId="delete-credit-card"
                    onClick={() => props.onDeleteCard(creditCard)}
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.STROKED}
                    className="!w-[52px] !h-[52px] bg-transparent"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="placeholder-credit-card" className="text-center px-3 py-6">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1" data-testid="empty-credit-card">
                No credit cards found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>

        <BillingDetailsFeature />
      </Section>

      <HelpSection
        data-testid="help-section"
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#billing',
            linkLabel: 'Learn more about billing',
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationBilling
