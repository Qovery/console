import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { type CSSProperties, useEffect, useState } from 'react'

export const AI_TOOL_NAMES = ['Claude', 'Cursor', 'Codex', 'Opencode', 'Gemini'] as const

export type AiToolName = (typeof AI_TOOL_NAMES)[number]

const DEFAULT_AI_TOOL_NAME: AiToolName = AI_TOOL_NAMES[0]

interface AiToolBadgeConfig {
  name: AiToolName
  badgeClassName: string
  textClassName: string
  badgeStyle?: CSSProperties
  iconSrc: string
  useCurrentColorIcon?: boolean
}

const CODEX_GRADIENT = 'linear-gradient(180deg, #B7A7FF 0%, #7196FF 48%, #3347FF 100%)'
const CODEX_GRADIENT_SUBTLE =
  'linear-gradient(180deg, rgba(183, 167, 255, 0.1), rgba(113, 150, 255, 0.1), rgba(51, 71, 255, 0.1))'
const GEMINI_GRADIENT = 'linear-gradient(90deg, #4893FC 0%, #4893FC 27%, #969DFF 77.6981%, #BD99FE 100%)'
const GEMINI_GRADIENT_SUBTLE =
  'linear-gradient(90deg, rgba(72, 147, 252, 0.1), rgba(72, 147, 252, 0.1), rgba(150, 157, 255, 0.1), rgba(189, 153, 254, 0.1))'

function gradientBadgeStyle(gradient: string): CSSProperties {
  return {
    background: `${gradient} padding-box, ${gradient} border-box`,
    borderColor: 'transparent',
  }
}

const GRADIENT_TEXT_CLASSNAME = 'bg-clip-text text-transparent'

const AI_TOOL_BADGES: Record<AiToolName, AiToolBadgeConfig> = {
  Claude: {
    name: 'Claude',
    badgeClassName: 'border-[#D97757]/10 bg-[#D97757]/10 text-[#D97757]',
    textClassName: 'text-[#D97757]',
    iconSrc: '/assets/ai-tools/claude.svg',
  },
  Cursor: {
    name: 'Cursor',
    badgeClassName: 'border-neutral bg-surface-neutral-subtle text-neutral',
    textClassName: 'text-neutral',
    iconSrc: '/assets/ai-tools/cursor.svg',
    useCurrentColorIcon: true,
  },
  Codex: {
    name: 'Codex',
    badgeClassName: 'border',
    badgeStyle: gradientBadgeStyle(CODEX_GRADIENT_SUBTLE),
    textClassName: GRADIENT_TEXT_CLASSNAME,
    iconSrc: '/assets/ai-tools/codex.png',
  },
  Opencode: {
    name: 'Opencode',
    badgeClassName: 'border-neutralInvert bg-surface-neutralInvert-component text-neutralInvert',
    textClassName: 'text-neutralInvert',
    iconSrc: '/assets/ai-tools/opencode.svg',
  },
  Gemini: {
    name: 'Gemini',
    badgeClassName: 'border',
    badgeStyle: gradientBadgeStyle(GEMINI_GRADIENT_SUBTLE),
    textClassName: GRADIENT_TEXT_CLASSNAME,
    iconSrc: '/assets/ai-tools/gemini.png',
  },
}

export interface AiToolBadgeProps {
  initialName?: string
}

export function AiToolBadge({ initialName = DEFAULT_AI_TOOL_NAME }: AiToolBadgeProps) {
  const reducedMotion = useReducedMotion()
  const initialToolName = AI_TOOL_NAMES.includes(initialName as AiToolName)
    ? (initialName as AiToolName)
    : DEFAULT_AI_TOOL_NAME
  const [toolIndex, setToolIndex] = useState(() => AI_TOOL_NAMES.indexOf(initialToolName))
  const tool = AI_TOOL_BADGES[AI_TOOL_NAMES[toolIndex]]
  const gradientStyle =
    tool.name === 'Codex'
      ? { backgroundImage: CODEX_GRADIENT }
      : tool.name === 'Gemini'
        ? { backgroundImage: GEMINI_GRADIENT }
        : undefined
  const textSpacingClassName = tool.name === 'Codex' || tool.name === 'Cursor' ? 'ml-1' : 'ml-0.5'
  const badgeClassName = `col-start-1 row-start-1 inline-flex h-5 items-center whitespace-nowrap rounded-full border pl-1 pr-1.5 ${tool.badgeClassName}`
  const icon = tool.useCurrentColorIcon ? (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 bg-current"
      style={{
        mask: `url(${tool.iconSrc}) center / contain no-repeat`,
        WebkitMask: `url(${tool.iconSrc}) center / contain no-repeat`,
      }}
    />
  ) : (
    <img src={tool.iconSrc} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setToolIndex((currentIndex) => (currentIndex + 1) % AI_TOOL_NAMES.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <span className="inline-grid h-5 shrink-0 items-center">
      <AnimatePresence initial={false}>
        <motion.span
          key={tool.name}
          className={badgeClassName}
          style={tool.badgeStyle}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)' }}
          animate={
            reducedMotion
              ? { opacity: 1, transition: { delay: 0.08, duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] } }
              : {
                  opacity: 1,
                  filter: 'blur(0px)',
                  transition: { delay: 0.08, duration: 0.18, ease: [0.55, 0.085, 0.68, 0.53] },
                }
          }
          exit={
            reducedMotion
              ? { opacity: 0, transition: { duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] } }
              : {
                  opacity: 0,
                  filter: 'blur(4px)',
                  transition: { duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] },
                }
          }
        >
          {icon}
          <span className={`${textSpacingClassName} ${tool.textClassName}`} style={gradientStyle}>
            {tool.name}
          </span>
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default AiToolBadge
