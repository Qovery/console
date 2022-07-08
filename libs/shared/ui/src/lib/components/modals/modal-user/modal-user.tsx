import { ButtonIcon, ButtonIconStyle, ModalContentProps } from '@console/shared/ui'
import Avatar from '../../avatar/avatar'
import { Button, ButtonStyle } from '../../buttons/button/button'
import { useNavigate } from 'react-router-dom'
import { LOGOUT_URL } from '@console/shared/router'

export interface ModalUserProps extends ModalContentProps {
  firstName: string
  lastName: string
}

export function ModalUser(props: ModalUserProps) {
  const { firstName = '', lastName = '' /*setOpen*/ } = props
  const navigate = useNavigate()

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
            onClick={() => navigate(LOGOUT_URL)}
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
