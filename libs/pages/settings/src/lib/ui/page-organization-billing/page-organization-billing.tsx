import { CreditCard } from 'qovery-typescript-axios'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputText,
} from '@qovery/shared/ui'

export interface PageOrganizationBillingProps {
  creditCards: CreditCard[]
  openNewCreditCardModal: () => void
  onDeleteCard: (creditCard: CreditCard) => void
}

export function PageOrganizationBilling(props: PageOrganizationBillingProps) {
  return (
    <div className="flex flex-col justify-between w-full max-w-content-with-navigation-left">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Payment method</h1>
          </div>
          <Button onClick={props.openNewCreditCardModal} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add new card
          </Button>
        </div>

        <BlockContent title="Credit cards">
          {props.creditCards.length > 0 ? (
            <div className="flex flex-col">
              <p className="text-2xs text-text-500 mb-5">
                You will be charged in USD / EUR - contact us for more details.
              </p>
              {props.creditCards.map((creditCard) => (
                <div key={creditCard.id} className="flex items-center justify-between mb-3 gap-3">
                  <InputText
                    name="Card number"
                    label="Card number"
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
                    onClick={() => props.onDeleteCard(creditCard)}
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.STROKED}
                    className="!w-[52px] !h-[52px]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="placeholder-credit-card" className="text-center px-3 py-6">
              <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
              <p className="text-text-400 font-medium text-xs mt-1">
                No credit cards found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
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
