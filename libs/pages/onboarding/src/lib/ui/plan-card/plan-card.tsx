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
    <div
      className="bg-element-light-lighter-200 border border-element-light-lighter-500 px-5 py-4 rounded"
      onClick={() => onClick(name)}
    >
      <h2 className="h5 mb-1">{title}</h2>
      <p className="text-sm text-text-500">{text}</p>
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
