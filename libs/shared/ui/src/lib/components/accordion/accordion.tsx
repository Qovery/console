import * as AccordionComponent from '@radix-ui/react-accordion'
import { type PropsWithChildren, type ReactNode } from 'react'
import Icon from '../icon/icon'

export interface AccordionProps {
  header: ReactNode
  open?: boolean
  disabled?: boolean
  className?: string
}

export function Accordion(props: PropsWithChildren<AccordionProps>) {
  const { header, children, open = false, disabled = false, className = '' } = props

  return (
    <AccordionComponent.Root
      type="single"
      defaultValue={open ? 'accordion' : undefined}
      disabled={disabled}
      collapsible
      className={className}
    >
      <AccordionComponent.Item value="accordion" className="accordion rounded border border-zinc-200">
        <AccordionComponent.Header className="accordion__header">
          <AccordionComponent.Trigger className="w-full h-full flex justify-between items-center px-4 gap-4">
            {header}
            <Icon name="icon-solid-caret-down" className="accordion__arrow" />
          </AccordionComponent.Trigger>
        </AccordionComponent.Header>
        <AccordionComponent.Content className="accordion__content !block">{children}</AccordionComponent.Content>
      </AccordionComponent.Item>
    </AccordionComponent.Root>
  )
}

export default Accordion
