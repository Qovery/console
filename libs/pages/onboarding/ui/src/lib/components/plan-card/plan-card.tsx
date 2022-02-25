import { InputRadio, PlanEnum } from '@console/shared/ui'

export interface Price {
  number: string
  price: string
}

export interface PlanCardProps {
  name: string
  selected: string
  title: string
  text: string
  price?: number
  listPrice?: Price[]
  currentValue?: { [name: string]: { number: string | undefined } }
  onClick: (plan: string) => void
}

export function PlanCard(props: PlanCardProps) {
  const { name, selected, title, text, price, listPrice = [], currentValue = {}, onClick } = props

  return (
    <div
      className={`${
        selected === name ? 'bg-white text-text-700' : 'text-text-500 bg-element-light-lighter-200'
      } p-5 mb-2 border border-element-light-lighter-500 rounded flex justify-between items-center cursor-pointer transition-all`}
      onClick={() => onClick(name)}
    >
      <div className="flex items-start gap-3">
        <InputRadio name="plan" value={name} isChecked={selected === name} />
        <div>
          <h2 className="leading-none text-base font-normal mb-1">
            <b className="font-bold">{title}</b> <span className="text-text-500">plan</span>
          </h2>
          <p className="text-sm text-text-500">{text}</p>
        </div>
      </div>
      {name !== PlanEnum.ENTERPRISE && (
        <p className="text-xl font-bold flex items-center gap-1">
          {'$'}
          {name === PlanEnum.PRO}
          {name === PlanEnum.FREE && price}
          {name === PlanEnum.BUSINESS &&
            listPrice.find((p) => p.number === currentValue[PlanEnum.BUSINESS].number)?.price}
          {name === PlanEnum.PRO && listPrice.find((p) => p.number === currentValue[PlanEnum.PRO].number)?.price}
          <span className="text-sm font-normal text-text-500">/ Month</span>
        </p>
      )}
      {name === PlanEnum.ENTERPRISE && <p className="text-xs font-bold uppercase">Contact us</p>}
    </div>
  )
}

export default PlanCard
