import Button, { ButtonStyle } from '../buttons/button/button'
import Icon from '../icon/icon'

export interface BlockContentDeleteProps {
  title: string
  description?: string
  className?: string
  list?: {
    text: string
    icon?: string
  }[]
  ctaLabel?: string
  callback?: () => void
}

export function BlockContentDelete(props: BlockContentDeleteProps) {
  const {
    title,
    className = '',
    description = 'All your data above are going to be deleted. Use it carefully this action is irreversible.',
    ctaLabel = 'Delete',
    callback,
    list,
  } = props

  return (
    <div className={`border border-error-300 bg-error-50 rounded ${className}`}>
      <div className="flex items-center justify-between h-9 px-4 border-b border-error-300">
        <h2 className="font-medium text-text-600 text-ssm">{title}</h2>
      </div>
      <div className="p-5">
        <p className="mb-5 text-sm text-text-600">{description}</p>
        {list?.map((element, index) => (
          <p key={index} data-testid={element.text} className="text-text-600 font-medium text-sm mb-2">
            <Icon name={element.icon || 'icon-solid-trash'} className="mr-3 text-error-500" />
            {element.text}
          </p>
        ))}
        <div className="flex justify-end">
          <Button className="mt-3 ml-auto" onClick={callback} style={ButtonStyle.ERROR}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BlockContentDelete
