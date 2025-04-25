import clsx from 'clsx'
import { type FormEventHandler, type ReactNode, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { twMerge } from '@qovery/shared/util-js'
import Button from '../../button/button'
import Icon from '../../icon/icon'
import { Popover } from '../../popover/popover'
import Truncate from '../../truncate/truncate'

export interface ModalCrudProps {
  children: ReactNode
  title: string
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdit?: boolean
  loading?: boolean
  description?: ReactNode
  submitLabel?: string
  forServiceName?: string
  onDelete?: () => void
  deleteButtonLabel?: string
  howItWorks?: ReactNode
}

export function ModalCrud(props: ModalCrudProps) {
  const {
    onSubmit,
    onClose,
    loading,
    children,
    title,
    isEdit,
    description,
    forServiceName,
    onDelete,
    submitLabel,
    deleteButtonLabel,
    howItWorks = null,
  } = props

  const { formState, trigger } = useFormContext()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isBottom, setIsBottom] = useState(true)
  const [isScrollable, setIsScrollable] = useState(false)

  useEffect(() => {
    if (isEdit) trigger().then()
  }, [trigger, isEdit])

  const checkScrollable = () => {
    const el = scrollRef.current
    if (!el) return
    const isScroll = el.scrollHeight > el.clientHeight + 4
    setIsScrollable(isScroll)
    setIsBottom(!isScroll || el.scrollTop + el.clientHeight >= el.scrollHeight - 4)
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
    setIsBottom(atBottom)
  }

  useEffect(() => {
    checkScrollable()
    const handleResize = () => checkScrollable()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [children])

  return (
    <div className="relative flex max-h-[80vh] flex-col overflow-hidden rounded-b">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={clsx('overflow-y-auto p-5 pb-0', isScrollable && 'pb-24')}
      >
        <h2 className="h4 max-w-sm truncate text-neutral-400 dark:text-neutral-50">{title}</h2>

        {description && <p className="mt-2 text-sm text-neutral-350 dark:text-neutral-50">{description}</p>}

        {forServiceName && (
          <div className="mt-4 flex items-center justify-between text-sm text-neutral-400 dark:text-neutral-50">
            <p>
              For{' '}
              <strong className="font-medium text-neutral-400 dark:text-neutral-50">
                <Truncate truncateLimit={60} text={forServiceName} />
              </strong>
            </p>
          </div>
        )}

        {howItWorks && (
          <Popover.Root>
            <Popover.Trigger>
              <span className="mt-2 cursor-pointer text-sm font-medium text-brand-500 transition hover:text-brand-600">
                Show how it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
              </span>
            </Popover.Trigger>
            <Popover.Content side="left" className="relative text-sm text-neutral-350" style={{ width: 440 }}>
              <h6 className="mb-2 font-medium text-neutral-400">How it works</h6>
              {howItWorks}
              <Popover.Close className="absolute right-4 top-4">
                <button type="button">
                  <Icon name="icon-solid-xmark text-lg leading-4 font-thin text-neutral-400" />
                </button>
              </Popover.Close>
            </Popover.Content>
          </Popover.Root>
        )}

        <form className="mt-6" onSubmit={onSubmit}>
          {children}
        </form>
      </div>

      <div
        className={twMerge(
          clsx(
            'mt-6 px-5 pb-5',
            isScrollable &&
              'absolute bottom-0 left-0 mt-0 w-full rounded-b bg-white p-5 transition-shadow dark:bg-neutral-900',
            isScrollable &&
              !isBottom &&
              'border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:border-neutral-700'
          )
        )}
      >
        <div className="flex justify-end gap-3">
          <Button
            data-testid="cancel-button"
            type="button"
            variant="plain"
            color="neutral"
            size="lg"
            onClick={() => onClose()}
          >
            Cancel
          </Button>
          {isEdit && onDelete && (
            <Button data-testid="delete-button" variant="outline" color="red" size="lg" onClick={() => onDelete()}>
              {deleteButtonLabel || 'Delete'}
            </Button>
          )}
          <Button
            data-testid="submit-button"
            type="submit"
            color="brand"
            size="lg"
            disabled={!formState.isValid}
            loading={loading}
          >
            {submitLabel || (isEdit ? 'Confirm' : 'Create')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModalCrud
