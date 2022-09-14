import posthog from 'posthog-js'
import { useSelector } from 'react-redux'
import { selectUser } from '@qovery/domains/user'
import { Link } from '@qovery/shared/ui'

export function NoBetaAccess() {
  const user = useSelector(selectUser)

  if (posthog.isFeatureEnabled('v3-beta')) {
    window.location.reload()
  }

  posthog.onFeatureFlags(() => {
    if (posthog.isFeatureEnabled('v3-beta')) {
      window.location.reload()
    }
  })

  return (
    <div className="w-full h-screen bg-brand-500 flex items-center justify-center text-element-light-darker-400">
      <div className="w-[400px] bg-white rounded p-6 text-center shadow-xl">
        <div className="flex justify-center mb-4">
          <img className="w-[80px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
        </div>
        <h3 className="mb-1">Access Denied!</h3>
        <p>
          Hello <b>{user.name}</b>, <br /> You do not have access to Qovery v3 Alpha yet. Contact us on Intercom to be
          invited
          <br />
          <span className="text-xs">
            (or go back to <Link link="https://console.qovery.com" linkLabel="Qovery Console V2"></Link> for now)
          </span>
        </p>
      </div>
    </div>
  )
}
