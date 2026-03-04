import { twMerge } from '@qovery/shared/util-js'

export interface ProgressIndicatorProps {
  message: string
  pauseLogs: boolean
  className?: string
}

export function ProgressIndicator({ pauseLogs, message, className }: ProgressIndicatorProps) {
  return (
    <div
      role="progressbar"
      className={twMerge(
        'mb-10 flex h-8 items-center border-b border-neutral bg-surface-neutral pl-4 text-sm font-bold text-neutral',
        className
      )}
    >
      <span className="mr-1.5">{pauseLogs ? 'Streaming paused' : message}</span>
      {!pauseLogs && (
        <>
          <span className="bg-neutral mr-[2px] h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_100ms_infinite] rounded-[0.5px]" />
          <span className="bg-neutral mr-[2px] h-[3px] w-[3px]  animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_300ms_infinite] rounded-[0.5px]" />
          <span className="bg-neutral h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_600ms_infinite] rounded-[0.5px]" />
        </>
      )}
    </div>
  )
}

export default ProgressIndicator
