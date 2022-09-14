//import { useProjects } from '@qovery/domains/projects'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, Icon } from '@qovery/shared/ui'

export interface AccordionOrganizationProps {
  open?: boolean
  name: string
  logo?: string | null
  className?: string
  organizationId: string
}

export function AccordionOrganization(props: AccordionOrganizationProps) {
  const { open = false, name, logo, className = '', organizationId } = props

  //const { projects, getProjects } = useProjects()

  /*const getOrganizationProjects = (orgId: string) => {
    getProjects(organizationId)
  }

  useEffect(() => {
    getProjects(organizationId)
  }, [getProjects])*/

  return (
    <Accordion
      open={open}
      className={className}
      header={
        <>
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-3">
              <img
                className="w-5 h-auto shrink-0"
                src={logo ? logo : 'https://console.qovery.com/assets/img/logos/logo.svg'}
              />
              <h4 className="font-medium text-sm text-text-500">{name}</h4>
            </div>
            <span className="text-xs text-text-500">
              {/*projects.length} project{projects.length <= 1 ? '' : 's'*/}
            </span>
          </div>
        </>
      }
    >
      <div className="p-2">
        {/*projects.map((project, index) => (
          <Link
            key={index}
            to={'/'}
            className="flex justify-between h-8 items-center px-3 bg-white hover:bg-element-light-lighter-300 rounded"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="w-4 h-4 flex justify-center items-center">
                {false && <Icon name="icon-solid-check" className="text-success-400 text-sm" />}
              </div>
              <h5 className="text-xs text-text-500 font-medium">{project.name}</h5>
            </div>
            {false && <span className="bg-error-500 w-1.5 h-1.5 rounded-full"></span>}
          </Link>
        ))*/}
      </div>
    </Accordion>
  )
}

export default AccordionOrganization
