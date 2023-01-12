import Accordion from '../../accordion/accordion'

export interface AccordionOrganizationProps {
  open?: boolean
  name: string
  logo?: string | null
  className?: string
}

export function AccordionOrganization(props: AccordionOrganizationProps) {
  const { open = false, name, logo, className = '' } = props

  return (
    <Accordion
      open={open}
      className={className}
      header={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-3">
            <img
              className="w-5 h-auto shrink-0"
              src={logo ? logo : 'https://console.qovery.com/assets/img/logos/logo.svg'}
            />
            <h4 className="font-medium text-sm text-text-500">{name}</h4>
          </div>
          <span className="text-xs text-text-500">{/*projects.length} project{projects.length <= 1 ? '' : 's'*/}</span>
        </div>
      }
    >
      <div className="p-2"></div>
    </Accordion>
  )
}

export default AccordionOrganization
