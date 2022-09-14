import { OrganizationPlanType, OrganizationPrice } from '@qovery/domains/organization'
import { InputRadio } from '@qovery/shared/ui'

export interface PlanCardProps {
  name: string
  selected: string
  title: string
  text: string
  price?: number
  listPrice?: OrganizationPrice[]
  currentValue?: { [name: string]: { number?: string | undefined } }
  onClick: (plan: string) => void
  disable?: boolean | undefined
}

export function PlanCard(props: PlanCardProps) {
  const { name, selected, title, text, price, listPrice = [], currentValue = {}, onClick, disable = false } = props

  return (
    <div
      className={`${
        selected === name ? 'bg-white text-text-700' : 'text-text-500 bg-element-light-lighter-200 hover:bg-white'
      } p-5 mb-2 border border-element-light-lighter-500 rounded flex justify-between items-center  transition-all ${
        disable ? 'opacity-50' : 'cursor-pointer hover:text-text-700'
      }`}
      onClick={() => (!disable ? onClick(name) : null)}
    >
      <div className="flex items-start gap-3">
        <InputRadio name="plan" value={name} isChecked={selected === name} disable={disable} />
        <div>
          <h2 className="leading-none text-base font-normal mb-1">
            <b className="font-bold">{title}</b> <span className="text-text-500">plan</span>
          </h2>
          <p className="text-sm text-text-500">{text}</p>
        </div>
      </div>
      {name !== OrganizationPlanType.ENTERPRISE && (
        <p className="text-xl font-bold flex items-center gap-1">
          {'$'}
          {name === OrganizationPlanType.PROFESSIONAL}
          {name === OrganizationPlanType.FREE && price}
          {name === OrganizationPlanType.BUSINESS &&
            listPrice.find((p) => p.number === currentValue[OrganizationPlanType.BUSINESS].number)?.price}
          {name === OrganizationPlanType.PROFESSIONAL &&
            listPrice.find((p) => p.number === currentValue[OrganizationPlanType.PROFESSIONAL].number)?.price}
          <span className="text-sm font-normal text-text-500">/ Month</span>
        </p>
      )}
      {name === OrganizationPlanType.ENTERPRISE && <p className="text-xs font-bold uppercase">Contact us</p>}
    </div>
  )
}

export default PlanCard
