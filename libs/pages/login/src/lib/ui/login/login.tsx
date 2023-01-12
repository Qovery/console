import { useEffect } from 'react'
import { AuthEnum, useInviteMember } from '@qovery/shared/auth'
import { InviteDetailsFeature } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { Icon } from '@qovery/shared/ui'

export interface ILoginProps {
  onClickAuthLogin: (provider: string) => void
  githubType: AuthEnum
  gitlabType: AuthEnum
  bitbucketType: AuthEnum
}

export function Login(props: ILoginProps) {
  const { onClickAuthLogin, githubType, gitlabType, bitbucketType } = props
  const { displayInvitation, checkTokenInStorage } = useInviteMember()

  useEffect(() => {
    checkTokenInStorage()
  }, [checkTokenInStorage])

  return (
    <div className="flex h-full max-w-screen-2xl ml-auto mr-auto bg-white">
      <div className="flex-[2_1_0%] px-4 md:px-20">
        <div className="max-w-lg mt-28 mx-auto">
          {!displayInvitation ? (
            <h1 className="h3 text-text-700 mb-3" data-testid="welcome-title">
              Welcome to Qovery
            </h1>
          ) : (
            <div className="mb-2">
              <InviteDetailsFeature />
            </div>
          )}
          <p className="text-sm mb-10 text-text-500">
            By registering and using Qovery, you agree to the processing of your personal data by Qovery as described in
            the
            <a href="https://www.qovery.com/terms" className="link text-accent2-500 ml-1">
              Privacy Policy
            </a>
            .
          </p>
          <button className="btn-login btn-login--github mb-3" onClick={() => onClickAuthLogin(githubType)}>
            <Icon className="absolute left-3" width="20" name={IconEnum.GITHUB_WHITE} />
            Sign in with Github
          </button>
          <button className="btn-login btn-login--default mb-3" onClick={() => onClickAuthLogin(gitlabType)}>
            <Icon className="absolute left-3" width="20" name={IconEnum.GITLAB} />
            Sign in with Gitlab
          </button>
          <button className="btn-login btn-login--default mb-3" onClick={() => onClickAuthLogin(bitbucketType)}>
            <Icon className="absolute left-3" width="20" name={IconEnum.BITBUCKET} />
            Sign in with Bitbucket
          </button>
        </div>
      </div>
      <div className="hidden xl:block flex-[1_1_0%] bg-element-light-lighter-300 px-20 before:absolute before:top-0 before:w-full before:h-full before:bg-element-light-lighter-300">
        <div className="max-w-md relative z-10">
          <h2 className="h1 text-text-700 mt-44 mb-6">Deliver Self-Service Infrastructure, Faster!</h2>
          <p className="text-text-500 mb-6 text-sm">Built for DevOps, Loved by Developers ✨</p>
          <ul className="list-disc pl-4 text-sm">
            <li className="font-bold text-text-500 mb-2">Fast Environment Provisioning</li>
            <li className="font-bold text-text-500 mb-2">
              <a
                href="https://hub.qovery.com/docs/using-qovery/configuration/environment/#preview-environment"
                className="link text-brand-500 mr-1"
              >
                Instant Preview Environments
              </a>
            </li>
            <li className="font-bold text-text-500 mb-2">Keep Governance and Control</li>
            <li className="font-bold text-text-500">
              <a href="https://hub.qovery.com/docs/using-qovery/integration" className="link text-brand-500 mr-1">
                100+ Integrations
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login
