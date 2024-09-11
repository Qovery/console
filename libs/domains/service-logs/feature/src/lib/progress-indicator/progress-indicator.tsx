export interface ProgressIndicatorProps {
  message: string
  pauseLogs: boolean
}

export function ProgressIndicator({ pauseLogs, message }: ProgressIndicatorProps) {
  return (
    <div
      role="progressbar"
      className="mb-7 flex h-8 items-center border-b border-neutral-500 bg-neutral-600 pl-4 text-sm text-neutral-350"
    >
      <span className="mr-1.5">{pauseLogs ? 'Streaming paused' : message}</span>
      {!pauseLogs && (
        <>
          <span className="mr-[2px] h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_100ms_infinite] rounded-[0.5px] bg-neutral-350" />
          <span className="mr-[2px] h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_300ms_infinite]  rounded-[0.5px] bg-neutral-350" />
          <span className="h-[3px] w-[3px] animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_600ms_infinite] rounded-[0.5px] bg-neutral-350" />
        </>
      )}
    </div>
  )
}

export default ProgressIndicator
