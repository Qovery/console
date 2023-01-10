import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { DatabaseCredentials, LoadingStatus } from '@qovery/shared/interfaces'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { Button, ButtonStyle, Icon, Skeleton, ToastBehavior, Tooltip } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface AboutProps {
  description?: string
  type?: DatabaseTypeEnum
  version?: string
  mode?: DatabaseModeEnum
  accessibility?: DatabaseAccessibilityEnum
  credentials?: DatabaseCredentials
  loadingStatus?: LoadingStatus
}

export function About(props: AboutProps) {
  const { description, type, version, mode, accessibility, credentials, loadingStatus } = props

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `${credentials?.login}:${credentials?.password}@${credentials?.host}:${credentials?.port}`
    )
    toast(ToastEnum.SUCCESS, 'Credentials copied to clipboard')
  }

  return (
    <div className="pt-2 pb-8 px-8 flex flex-col items-start border-b border-element-light-lighter-400">
      <div className="text-subtitle mb-3 text-text-600">About</div>
      <p className="text-text-500 mb-5">{description ? description : 'No description provided yet'}</p>
      <Skeleton height={24} width={120} show={!loadingStatus || loadingStatus === 'loading'} className="mb-5">
        <div className="flex gap-2 items-center px-2 h-6 capitalize border leading-0 rounded border-element-light-lighter-500 text-text-500 text-sm font-medium">
          <Icon name={type || ''} className="w-4" />
          {type && type} v{version && version}
        </div>
      </Skeleton>

      <Skeleton height={24} width={120} show={!loadingStatus || loadingStatus === 'loading'} className="mb-2">
        <div className="flex">
          <p className="text-text-500">Mode : </p>
          <p className="text-text-500 ml-1 font-medium">{upperCaseFirstLetter(mode?.toLowerCase())}</p>
        </div>
      </Skeleton>
      <Skeleton height={24} width={120} show={!loadingStatus || loadingStatus === 'loading'} className="mb-5">
        <div className="flex">
          <p className="text-text-500">Accessibility : </p>
          <p className="text-text-500 ml-1 font-medium">{upperCaseFirstLetter(accessibility?.toLowerCase())}</p>
        </div>
      </Skeleton>

      <Skeleton height={36} width={70} show={!loadingStatus || loadingStatus === 'loading'}>
        <Tooltip content="Copy" side="bottom">
          <div>
            <Button
              style={ButtonStyle.STROKED}
              iconLeft="icon-solid-key"
              className="capitalize"
              onClick={copyToClipboard}
            >
              Credentials
            </Button>
            <ToastBehavior />
          </div>
        </Tooltip>
      </Skeleton>
    </div>
  )
}

export default About
