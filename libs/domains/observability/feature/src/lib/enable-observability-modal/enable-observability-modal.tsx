import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Button, useModal } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'

export function EnableObservabilityContent({ className }: { className?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="h4 max-w-sm truncate text-neutral-400 dark:text-neutral-50">Observability is here!</h2>
      <div className={twMerge('flex flex-col leading-relaxed', className)}>
        <p className="leading-normal text-neutral-350 dark:text-neutral-50">
          We've just released our brand-new Observability feature, now available for everyone. <br />
          Why is this exciting?
        </p>
        <ul className="list-disc pl-5 text-neutral-350">
          <li>
            <strong>1-click setup</strong>: Dev + Ops friendly
          </li>
          <li>
            <strong>Zero maintenance</strong>: Qovery manages it for you within your infrastructure
          </li>
          <li>
            <strong>Your data stays in your infrastructure</strong>
          </li>
          <li>
            <strong>Correlated infrastructure and application events</strong>: troubleshoot with ease
          </li>
          <li>
            <strong>Faster recovery</strong>: strong MTTR (Mean Time to Repair) reduction
          </li>
          <li>
            <strong>Built to be used by Software Engineers</strong>: troubleshoot and recover directly from your
            application
          </li>
        </ul>
      </div>
    </div>
  )
}

export function EnableObservabilityVideo() {
  const [showIframe, setShowIframe] = useState(false)

  // Hack to avoid having small glitch when the modal is opened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIframe(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative box-content aspect-video max-h-[80svh] w-full">
      <iframe
        src="https://app.supademo.com/embed/cmfcqnhn97zlz39ozsterxe7n?embed_v=2&utm_source=embed"
        loading="lazy"
        title="Monitor application performance in real time"
        allow="clipboard-write"
        allowFullScreen
        className={clsx(
          'absolute left-0 top-0 h-full w-full',
          showIframe ? 'animate-[fadein_0.12s_ease-in-out_forwards]' : 'rounded bg-neutral-100'
        )}
        style={showIframe ? undefined : { visibility: 'hidden' }}
      />
    </div>
  )
}

export function EnableObservabilityButtonContactUs({ callback }: { callback?: () => void }) {
  const { showPylonForm } = useSupportChat()

  return (
    <Button
      color="brand"
      variant="solid"
      size="md"
      onClick={() => {
        callback?.()
        showPylonForm('request-access-observability')
      }}
    >
      Contact us
    </Button>
  )
}

export function EnableObservabilityModal() {
  const { closeModal } = useModal()

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden pb-[104px]">
      <div className="px-8 pt-10">
        <EnableObservabilityContent />
      </div>
      <div className="px-5">
        <EnableObservabilityVideo />
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-end gap-4 rounded-b border-t border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-400 shadow-[0_-6px_12px_-6px_rgba(16,30,54,0.06)]">
        <span>Starting from $299/month</span>
        <EnableObservabilityButtonContactUs callback={() => closeModal()} />
      </div>
    </div>
  )
}

export default EnableObservabilityModal
