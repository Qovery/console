import { type SVGProps } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="text-brand"
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      viewBox="0 0 28 28"
      {...props}
    >
      <path
        fill="currentColor"
        d="m24.01 7.043-9.082-5.244a1.82 1.82 0 0 0-1.817 0L4.03 7.043a1.82 1.82 0 0 0-.908 1.573v10.487c0 .65.346 1.249.908 1.573l9.99 5.769v-5.769c0-.324.174-.624.455-.787l4.995-2.883v6.292l4.541-2.622c.562-.324.908-.924.908-1.573V8.616c0-.649-.346-1.248-.908-1.573m-10.444 7.079L8.57 17.006v-5.769c0-.324.173-.624.454-.787l4.542-2.62a.91.91 0 0 1 .908 0l4.54 2.62a.91.91 0 0 1 .455.787v5.769l-4.995-2.884a.91.91 0 0 0-.908 0"
      ></path>
    </svg>
  )
}

interface AgentIconProps {
  className?: string
}

export function AgentIcon({ className }: AgentIconProps) {
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        "inline-block h-5 w-5 shrink-0 bg-current text-brand [-webkit-mask-image:url('/assets/logos/agent-space.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:80%_80%] [mask-image:url('/assets/logos/agent-space.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:80%_80%]",
        className
      )}
    />
  )
}

export default LogoIcon
