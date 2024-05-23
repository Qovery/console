import { Button } from '../button/button'
import Icon from '../icon/icon'
import useModalConfirmation from '../modals/modal-confirmation/use-modal-confirmation/use-modal-confirmation'

export interface BlockContentDeleteProps {
  title: string
  modalConfirmation?: {
    title: string
    name?: string
    mode?: string
  }
  description?: string
  className?: string
  list?: {
    text: string
    icon?: string
  }[]
  ctaLabel?: string
  ctaLoading?: boolean
  callback?: () => void
  customWidth?: string
  customModalConfirmation?: () => void
}

export function BlockContentDelete(props: BlockContentDeleteProps) {
  const {
    title,
    className = '',
    customWidth = 'w-full',
    description = 'All your data are going to be deleted. Use it carefully this action is irreversible. The operation might take a few minutes to complete.',
    ctaLabel = 'Delete',
    callback,
    list,
    modalConfirmation,
    ctaLoading,
    customModalConfirmation,
  } = props

  const { openModalConfirmation } = useModalConfirmation()

  return (
    <div className={`rounded border border-red-300 bg-red-50 ${className} ${customWidth}`}>
      <div className="flex h-9 items-center justify-between border-b border-red-300 px-4">
        <h2 className="text-ssm font-medium text-neutral-400">{title}</h2>
      </div>
      <div className="p-5">
        <p className="mb-5 text-sm text-neutral-400">{description}</p>
        {list?.map((element, index) => (
          <p key={index} data-testid={element.text} className="mb-2 text-sm font-medium text-neutral-400">
            <Icon name={element.icon || 'icon-solid-trash'} className="mr-3 text-red-500" />
            {element.text}
          </p>
        ))}
        <div className="flex justify-end">
          <Button
            className="ml-auto mt-3"
            loading={ctaLoading}
            onClick={() => {
              customModalConfirmation
                ? customModalConfirmation()
                : openModalConfirmation({
                    title: modalConfirmation?.title ?? '',
                    mode: modalConfirmation?.mode,
                    name: modalConfirmation?.name,
                    action: () => callback && callback(),
                    isDelete: true,
                  })
            }}
            color="red"
            size="md"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BlockContentDelete
