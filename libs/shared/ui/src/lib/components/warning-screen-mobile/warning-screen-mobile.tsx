import { useState } from 'react'
import { Button } from '../button/button'

export function WarningScreenMobile() {
  const [hide, setHide] = useState(false)

  if (hide) return null

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-brand-500 text-neutral-650 lg:hidden ">
      <div className="w-[400px] rounded bg-white p-6 text-center shadow-xl">
        <div className="mb-4 flex justify-center">
          <img className="w-[80px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p>Qovery console is not web responsive yet. Please use a bigger screen.</p>
          <Button className="max-w-max" onClick={() => setHide(true)}>
            Continue anyway
          </Button>
          <p className="text-xs text-neutral-350">
            Not recommended: the console is not responsive and your experience may be degraded.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WarningScreenMobile
