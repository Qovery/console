export interface PlanCardProps {
  name: string
  title: string
  text: string
  price?: number
  onClick: (plan: string) => void
}

export function PlanCard(props: PlanCardProps) {
  const { name, title, text, onClick } = props

  return (
    <div className="" onClick={() => onClick(name)}>
      <div className="flex items-start gap-3">
        <h2 className="leading-none text-base font-normal mb-1">
          <b className="font-bold">{title}</b> <span className="text-text-500">plan</span>
        </h2>
        <p className="text-sm text-text-500">{text}</p>
      </div>
      {/* {name !== OrganizationPlanType.ENTERPRISE && (
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
      )} */}
      {/* {name === OrganizationPlanType.ENTERPRISE && <p className="text-xs font-bold uppercase">Contact us</p>} */}
    </div>
  )
}

export default PlanCard
