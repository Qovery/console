import clsx from 'clsx'
import { type ComponentProps, forwardRef, useState } from 'react'
import { Button, Icon, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

interface InputProps extends ComponentProps<'textarea'> {
  loading: boolean
  onClick?: () => void
  stop?: () => void
}

export const Input = forwardRef<HTMLTextAreaElement, InputProps>(({ onClick, stop, loading, ...props }, ref) => {
  const [isFocus, setIsFocus] = useState(false)

  return (
    <div
      className={twMerge(
        clsx(
          'relative z-[1] flex rounded-xl border border-neutral-250 bg-white dark:border-neutral-500 dark:bg-neutral-550',
          {
            'border-brand-500 outline outline-[3px] outline-brand-100 dark:outline-1 dark:outline-brand-500': isFocus,
          }
        )
      )}
    >
      <textarea
        ref={ref}
        placeholder="Ask Qovery Copilot"
        autoFocus
        className="min-h-12 w-full resize-none rounded-xl px-4 py-[13px] text-sm leading-[22px] text-neutral-400 transition-[height] placeholder:text-neutral-350 focus-visible:outline-none dark:border-neutral-350 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-250"
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        {...props}
      />
      <div className="flex items-end justify-end p-2">
        <Tooltip content={loading ? 'Stop generation' : 'Send now'} delayDuration={400} classNameContent="z-10">
          <Button
            disabled={props.disabled}
            type="button"
            variant="surface"
            radius="full"
            className="group relative bottom-0.5 h-7 w-7 min-w-7 justify-center text-neutral-500 transition-colors dark:text-white"
            onClick={() => {
              if (loading) {
                stop?.()
              } else {
                onClick?.()
              }
            }}
          >
            {!loading ? (
              <Icon iconName="arrow-up" className={loading ? 'opacity-0' : ''} />
            ) : (
              <>
                <LoaderSpinner className="absolute left-0 right-0 m-auto group-hover:opacity-0" theme="dark" />
                <Icon
                  className="absolute left-0 right-0 m-auto opacity-0 group-hover:opacity-100"
                  iconName="stop"
                  iconStyle="light"
                />
              </>
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
})

Input.displayName = 'Input'
