import { useEffect } from 'react'
import { AuthEnum, useInviteMember } from '@qovery/shared/auth'
import { InviteDetailsFeature } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { Button, Icon, Section } from '@qovery/shared/ui'

export interface ILoginProps {
  onClickAuthLogin: (provider: string) => void
  loading?: { provider: string; active: boolean }
}

export function Login({ onClickAuthLogin, loading }: ILoginProps) {
  const { displayInvitation, checkTokenInStorage } = useInviteMember()

  useEffect(() => {
    checkTokenInStorage()
  }, [checkTokenInStorage])

  return (
    <div className="flex h-screen max-w-screen-2xl ml-auto mr-auto bg-white">
      <Section className="w-1/2 px-4 md:px-20">
        <div className="max-w-lg mt-28 mx-auto">
          {!displayInvitation ? (
            <h1 className="h3 text-neutral-400 mb-3" data-testid="welcome-title">
              Welcome to Qovery
            </h1>
          ) : (
            <div className="mb-2">
              <InviteDetailsFeature />
            </div>
          )}
          <p className="text-sm mb-10 text-neutral-400">
            By registering and using Qovery, you agree to the processing of your personal data by Qovery as described in
            the
            <a href="https://www.qovery.com/terms" className="link text-sky-500 ml-1">
              Privacy Policy
            </a>
            .
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="surface"
              color="neutral"
              size="lg"
              className="w-full justify-center"
              onClick={() => onClickAuthLogin(AuthEnum.GITHUB)}
              loading={loading?.provider === AuthEnum.GITHUB ? loading.active : false}
            >
              <Icon
                width="20"
                className={`mr-3 ${loading?.provider === AuthEnum.GITHUB ? 'opacity-0' : ''}`}
                name={IconEnum.GITHUB}
              />
              Continue with Github
            </Button>
            <Button
              variant="surface"
              color="neutral"
              size="lg"
              className="w-full justify-center"
              onClick={() => onClickAuthLogin(AuthEnum.GITLAB)}
              loading={loading?.provider === AuthEnum.GITLAB ? loading.active : false}
            >
              <Icon
                width="20"
                className={`mr-3 ${loading?.provider === AuthEnum.GITLAB ? 'opacity-0' : ''}`}
                name={IconEnum.GITLAB}
              />
              Continue with Gitlab
            </Button>
            <Button
              variant="surface"
              color="neutral"
              size="lg"
              className="w-full justify-center"
              onClick={() => onClickAuthLogin(AuthEnum.BITBUCKET)}
              loading={loading?.provider === AuthEnum.BITBUCKET ? loading.active : false}
            >
              <Icon
                width="20"
                className={`mr-3 ${loading?.provider === AuthEnum.BITBUCKET ? 'opacity-0' : ''}`}
                name={IconEnum.BITBUCKET}
              />
              Continue with Bitbucket
            </Button>
            <Button
              variant="surface"
              color="neutral"
              size="lg"
              className="w-full justify-center"
              onClick={() => onClickAuthLogin(AuthEnum.GOOGLE_SSO)}
              loading={loading?.provider === AuthEnum.GOOGLE_SSO ? loading.active : false}
            >
              <Icon
                width="20"
                className={`mr-3 ${loading?.provider === AuthEnum.GOOGLE_SSO ? 'opacity-0' : ''}`}
                name={IconEnum.GOOGLE}
              />
              Continue with Google
            </Button>
            <Button
              variant="surface"
              color="neutral"
              size="lg"
              className="w-full justify-center"
              onClick={() => onClickAuthLogin(AuthEnum.MICROSOFT)}
              loading={loading?.provider === AuthEnum.MICROSOFT ? loading.active : false}
            >
              <Icon
                width="20"
                className={`mr-3 ${loading?.provider === AuthEnum.MICROSOFT ? 'opacity-0' : ''}`}
                name={IconEnum.MICROSOFT}
              />
              Continue with Microsoft
            </Button>
          </div>
        </div>
      </Section>
      <Section className="hidden xl:block w-1/2 bg-neutral-150 px-20 before:absolute before:top-0 before:w-full before:h-full before:bg-neutral-150">
        <div className="max-w-md relative">
          <h2 className="h1 text-neutral-400 mt-44 mb-6">Deliver Self-Service Infrastructure, Faster!</h2>
          <p className="text-neutral-400 mb-6 text-sm">
            Built for DevOps, Loved by Developers{' '}
            <span role="img" aria-label="stars">
              ✨
            </span>
          </p>
          <ul className="list-disc pl-4 text-sm">
            <li className="font-bold text-neutral-400 mb-2">Fast Environment Provisioning</li>
            <li className="font-bold text-neutral-400 mb-2">
              <a
                href="https://hub.qovery.com/docs/using-qovery/configuration/environment/#preview-environment"
                className="link text-brand-500 mr-1"
              >
                Instant Preview Environments
              </a>
            </li>
            <li className="font-bold text-neutral-400 mb-2">Keep Governance and Control</li>
            <li className="font-bold text-neutral-400">
              <a href="https://hub.qovery.com/docs/using-qovery/integration" className="link text-brand-500 mr-1">
                100+ Integrations
              </a>
            </li>
          </ul>
        </div>
      </Section>
    </div>
  )
}

export default Login
