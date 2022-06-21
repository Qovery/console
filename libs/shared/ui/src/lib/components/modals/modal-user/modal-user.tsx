import { ButtonIcon, ButtonIconStyle, ModalContentProps } from '@console/shared/ui'
//import { SETTINGS_URL } from '@console/shared/router'
//import { useParams } from 'react-router'
import Avatar from '../../avatar/avatar'
import { Button, ButtonStyle } from '../../buttons/button/button'

export interface ModalUserProps extends ModalContentProps {
  authLogout: () => void
  firstName: string
  lastName: string
}

export function ModalUser(props: ModalUserProps) {
  const { authLogout, firstName = '', lastName = '' /*setOpen*/ } = props

  //const { organizationId } = useParams()

  return (
    <>
      <div className="pt-4 pb-7 px-5">
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
          </div>
          <h3 className="text-base font-medium text-text-500 mb-3">
            {firstName} {lastName}
          </h3>

          <Button
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-wheel"
            external
            link="https://console.qovery.com/platform/organization/user/settings/general"
          >
            Settings
          </Button>
        </div>
      </div>
    </>
  )
}

export default ModalUser
