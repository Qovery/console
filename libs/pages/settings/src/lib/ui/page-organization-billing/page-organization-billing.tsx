import { type CreditCard } from 'qovery-typescript-axios'
import {
  BlockContent,
  Button,
  Heading,
  Icon,
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
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between">
      <Section className="p-8">
        <div className="mb-8 flex justify-between">
          <Heading className="mb-2">Payment method</Heading>
          <Button onClick={props.openNewCreditCardModal} size="md" className="gap-2" data-testid="add-new-card-button">
            Add new card
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </div>

        <BlockContent title="Credit cards">
          {props.creditCardLoading && props.creditCards.length === 0 ? (
            <div className="flex justify-center">
              <LoaderSpinner />
            </div>
          ) : props.creditCards.length > 0 ? (
            <div className="flex flex-col">
              <p className="mb-5 text-xs text-neutral-400">
                You will be charged in USD / EUR - contact us for more details.
              </p>
              {props.creditCards.map((creditCard) => (
                <div
                  data-testid="credit-card-row"
                  key={creditCard.id}
                  className="mb-3 flex items-center justify-between gap-3"
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
                  <Button
                    data-testid="delete-credit-card"
                    className="h-[52px] w-[52px] justify-center"
                    variant="surface"
                    color="neutral"
                    onClick={() => props.onDeleteCard(creditCard)}
                  >
                    <Icon iconName="trash" className="text-sm" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="placeholder-credit-card" className="px-3 py-6 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="mt-1 text-xs font-medium text-neutral-350" data-testid="empty-credit-card">
                No credit cards found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>

        <BillingDetailsFeature />
      </Section>
    </div>
  )
}

export default PageOrganizationBilling
