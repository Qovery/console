import { Tooltip } from '../tooltip/tooltip'

export interface TruncateProps {
  truncateLimit: number
  text: string
  defaultTooltipLimit?: number
  delayDuration?: number
}

export const truncateText = (text: string, truncateLimit: number) => text.slice(0, truncateLimit)

export function Truncate(props: TruncateProps) {
  const { truncateLimit, text, defaultTooltipLimit = 200, delayDuration = 150 } = props

  if (text.length >= truncateLimit) {
    return (
      <Tooltip
        delayDuration={delayDuration}
        content={text.length >= defaultTooltipLimit ? `${truncateText(text, defaultTooltipLimit)}...` : text}
      >
        <span data-testid="truncate-text">{truncateText(text, truncateLimit)}...</span>
      </Tooltip>
    )
  } else {
    // disabled because we need return an JSX component and not a text
    // eslint-disable-next-line
    return <>{text}</>
  }
}

export default Truncate
