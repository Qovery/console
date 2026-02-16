import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import { type default as FieldContainer } from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import { type default as CbInstance } from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type CreditCard } from 'qovery-typescript-axios'
import { type FormEventHandler, type RefObject } from 'react'
import { type Value } from '@qovery/shared/interfaces'
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
import { fieldStyles } from '@qovery/shared/util-payment'
import BillingDetails from './billing-details/billing-details'

export interface PageOrganizationBillingProps {
  creditCards: CreditCard[]
  onAddCard: (cardId?: string) => void
  onDeleteCard: (creditCard: CreditCard) => void
  creditCardLoading?: boolean
  showAddCard?: boolean
  onCancelAddCard?: () => void
  cbInstance?: CbInstance | null
  cardRef?: RefObject<FieldContainer>
  onCardReady?: () => void
  countryValues?: Value[]
  loadingBillingInfos?: boolean
  editInProcess?: boolean
  onSubmit?: FormEventHandler<HTMLFormElement>
}

export function PageOrganizationBilling(props: PageOrganizationBillingProps) {
  return (
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between">
      <Section className="p-8">
        <Heading className="mb-2">Payment method</Heading>

        <BlockContent title="Billing details" className="mt-10">
          <div className="mb-6" data-credit-card-section>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-400">Credit card</h3>
            </div>

            {props.creditCardLoading && props.creditCards.length === 0 && !props.showAddCard ? (
              <div className="flex justify-center">
                <LoaderSpinner />
              </div>
            ) : (
              <>
                {props.creditCards.length > 0 && !props.showAddCard && (
                  <div className="flex flex-col">
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
                          data-testid="edit-credit-card"
                          className="h-[52px] w-[52px] justify-center"
                          variant="surface"
                          color="neutral"
                          onClick={() => props.onAddCard(creditCard.id)}
                        >
                          <Icon iconName="pen" className="text-sm" />
                        </Button>
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
                )}

                {props.showAddCard && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-neutral-400">Add credit card</h4>
                      <button
                        type="button"
                        onClick={props.onCancelAddCard}
                        className="text-sm text-neutral-350 hover:text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>

                    {!props.cbInstance ? (
                      <div className="flex justify-center py-4">
                        <LoaderSpinner />
                      </div>
                    ) : (
                      <Provider cbInstance={props.cbInstance}>
                        <CardComponent
                          ref={props.cardRef}
                          styles={fieldStyles}
                          locale="en"
                          currency="USD"
                          onReady={props.onCardReady}
                        >
                          <div className="chargebee-field-wrapper">
                            <label className="chargebee-field-label">Card Number</label>
                            <CardNumber placeholder="1234 1234 1234 1234" />
                          </div>
                          <div className="chargebee-fields-row">
                            <div className="chargebee-field-wrapper">
                              <label className="chargebee-field-label">Expiry</label>
                              <CardExpiry placeholder="MM / YY" />
                            </div>
                            <div className="chargebee-field-wrapper">
                              <label className="chargebee-field-label">CVV</label>
                              <CardCVV placeholder="CVV" />
                            </div>
                          </div>
                        </CardComponent>
                      </Provider>
                    )}
                  </>
                )}

                {!props.showAddCard && props.creditCards.length === 0 && (
                  <div data-testid="placeholder-credit-card" className="px-3 py-6 text-center">
                    <Icon iconName="wave-pulse" className="text-neutral-350" />
                    <p className="mt-1 text-xs font-medium text-neutral-350" data-testid="empty-credit-card">
                      No credit card found. <br /> Please add one.
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => props.onAddCard()}
                        size="md"
                        variant="outline"
                        className="gap-2"
                        data-testid="add-new-card-button"
                      >
                        Add new card
                        <Icon iconName="circle-plus" iconStyle="regular" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="my-6 border-t border-neutral-250" />

          <BillingDetails
            countryValues={props.countryValues}
            loadingBillingInfos={props.loadingBillingInfos}
            editInProcess={props.editInProcess}
            onSubmit={props.onSubmit}
          />
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationBilling
