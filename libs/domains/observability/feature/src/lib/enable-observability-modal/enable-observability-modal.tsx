import { Button, useModal } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'

export function EnableObservabilityContent() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="h4 max-w-sm truncate text-neutral-400 dark:text-neutral-50">
        Observability early access is here!
      </h2>
      <div className="flex flex-col leading-6">
        <p className="text-neutral-350 dark:text-neutral-50">
          Weve just opened the Early Access for our brand-new Observability feature. <br />
          Why is this exciting?
        </p>
        <ul className="list-disc pl-5 text-neutral-350">
          <li>1-click setup, Dev + Ops friendly.</li>
          <li>Low-opinionated, streamlined customization.</li>
          <li>No maintenance needed (Qovery is managed within your infrastructure).</li>
          <li>Data stays in the customer infrastructure.</li>
          <li>Correlated Infra + App coverage for easy troubleshooting.</li>
          <li>Strong MTTR (Mean time to repair) reduction.</li>
          <li>Designed for use by Software Engineers (troubleshoot & recover apps directly)</li>
        </ul>
      </div>
    </div>
  )
}

export function EnableObservabilityVideo() {
  return (
    <div className="relative box-content aspect-video max-h-[80svh] w-full">
      <iframe
        src="https://app.supademo.com/embed/cmfcqnhn97zlz39ozsterxe7n?embed_v=2&utm_source=embed"
        loading="lazy"
        title="Monitor application performance in real time"
        allow="clipboard-write"
        allowFullScreen
        className="absolute left-0 top-0 h-full w-full"
      />
    </div>
  )
}

export function EnableObservabilityButtonContactUs({
  callback,
  size = 'md',
}: {
  callback?: () => void
  size?: 'md' | 'lg'
}) {
  const { showPylonForm } = useSupportChat()

  return (
    <Button
      color="brand"
      variant="solid"
      size={size}
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
        <EnableObservabilityButtonContactUs size="lg" callback={() => closeModal()} />
      </div>
    </div>
  )
}

export default EnableObservabilityModal
