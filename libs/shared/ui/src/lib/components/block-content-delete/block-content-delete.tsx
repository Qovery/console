import ButtonLegacy, { ButtonLegacyStyle } from '../buttons/button-legacy/button-legacy'
import Icon from '../icon/icon'
import useModalConfirmation from '../modals/modal-confirmation/use-modal-confirmation/use-modal-confirmation'

export interface BlockContentDeleteProps {
  title: string
  modalConfirmation: {
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
  } = props

  const { openModalConfirmation } = useModalConfirmation()

  return (
    <div className={`border border-red-300 bg-red-50 rounded ${className} ${customWidth}`}>
      <div className="flex items-center justify-between h-9 px-4 border-b border-red-300">
        <h2 className="font-medium text-neutral-400 text-ssm">{title}</h2>
      </div>
      <div className="p-5">
        <p className="mb-5 text-sm text-neutral-400">{description}</p>
        {list?.map((element, index) => (
          <p key={index} data-testid={element.text} className="text-neutral-400 font-medium text-sm mb-2">
            <Icon name={element.icon || 'icon-solid-trash'} className="mr-3 text-red-500" />
            {element.text}
          </p>
        ))}
        <div className="flex justify-end">
          <ButtonLegacy
            className="mt-3 ml-auto"
            loading={ctaLoading}
            onClick={() => {
              openModalConfirmation({
                mode: modalConfirmation.mode,
                title: modalConfirmation.title,
                name: modalConfirmation.name,
                action: () => callback && callback(),
                isDelete: true,
              })
            }}
            style={ButtonLegacyStyle.ERROR}
          >
            {ctaLabel}
          </ButtonLegacy>
        </div>
      </div>
    </div>
  )
}

export default BlockContentDelete
