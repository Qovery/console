import { ButtonIcon, ButtonIconStyle } from '@console/shared/ui'
import AccordionOrganization, {
  AccordionOrganizationProjectProps,
  AccordionOrganizationProps,
} from '../../accordions/accordion-organization/accordion-organization'
import Avatar from '../../avatar/avatar'
import { Button, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'

export interface ModalUserProps {
  authLogout: () => void
  firstName: string
  lastName: string
}

export function ModalUser(props: ModalUserProps) {
  const { authLogout, firstName = 'William', lastName = 'Traoré' } = props

  const sampleProject: AccordionOrganizationProjectProps[] = [
    { name: 'Project 1', isCheck: true, link: '/', error: true },
    { name: 'Project 2', link: '/' },
    { name: 'Project 3', link: '/' },
    { name: 'Project 4', link: '/', error: true },
  ]

  const sampleOrg: AccordionOrganizationProps[] = [
    {
      name: 'Qovery',
      projects: sampleProject,
      logo: 'https://console.qovery.com/assets/img/logos/logo.svg',
      open: true,
    },
    { name: 'Qovery 2', projects: sampleProject, logo: 'https://console.qovery.com/assets/img/logos/logo.svg' },
    { name: 'Qovery 3', projects: sampleProject, logo: 'https://console.qovery.com/assets/img/logos/logo.svg' },
    { name: 'Qovery 4', projects: sampleProject, logo: 'https://console.qovery.com/assets/img/logos/logo.svg' },
  ]

  return (
    <>
      <div className="py-4 px-5 border-b border-element-light-lighter-400">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-text-400">Account</p>
          <ButtonIcon
            icon="icon-solid-arrow-right-from-bracket"
            iconClassName="text-brand-500"
            style={ButtonIconStyle.ALT}
            onClick={authLogout}
          />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="relative cursor-pointer">
            <Avatar firstName={firstName} lastName={lastName} size={64} />
            <span className="w-5 h-5 rounded-full bg-element-light-lighter-300 border-2 border-white absolute -right-1 -bottom-1 flex justify-center items-center">
              <Icon name="icon-solid-camera" className="text-text-500 text-[10px]" />
            </span>
          </div>
          <h3 className="text-base font-medium text-text-500">
            {firstName} {lastName}
          </h3>
        </div>
      </div>
      <div className="py-4 px-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-text-400">Organizations and projects</p>
          <Button iconRight="icon-solid-plus" style={ButtonStyle.FLAT} className="!px-0 !py-0 !h-auto !font-normal">
            Create new
          </Button>
        </div>

        {sampleOrg.map((org, index) => (
          <AccordionOrganization
            name={org.name}
            logo={org.logo}
            projects={org.projects}
            open={org.open}
            className={index !== sampleOrg.length - 1 ? 'mb-2' : ''}
          />
        ))}
      </div>
    </>
  )
}

export default ModalUser
