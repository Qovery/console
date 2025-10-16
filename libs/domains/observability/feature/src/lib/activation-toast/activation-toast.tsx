import { Icon, useModal } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { EnableObservabilityModal } from '../enable-observability-modal/enable-observability-modal'

export function ActivationToast() {
  const { openModal } = useModal()
  const [isOpen, setIsOpen] = useLocalStorage('observability-activation-toast-open', true)

  if (!isOpen) return null

  return (
    <div className="fixed bottom-[81px] right-[17px] animate-[scalein_0.12s_ease-in-out_forwards_0.3s] opacity-0">
      <div
        onClick={() =>
          openModal({
            content: <EnableObservabilityModal />,
            options: {
              width: 680,
            },
          })
        }
        className="group relative h-24 w-[375px] cursor-pointer overflow-hidden rounded-lg bg-white py-3 pl-24 pr-2 shadow-[0px_16px_24px_-6px_rgba(27,36,44,0.16),0px_2px_2px_-1px_rgba(27,36,44,0.04)] transition-all will-change-transform hover:shadow-[0px_16px_24px_-6px_rgba(27,36,44,0.18),0px_2px_2px_-1px_rgba(27,36,44,0.06)] active:!scale-[0.98]"
      >
        <Background className="pointer-events-none absolute bottom-0 left-0 h-full w-full select-none" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(false)
          }}
          className="absolute right-3 top-3 z-[1] flex h-4 w-4 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-350"
        >
          <Icon iconName="xmark" iconStyle="regular" />
        </button>
        <div className="relative flex flex-col gap-2 text-sm">
          <div>
            <p className="font-medium">Observability is here!</p>
            <span className="text-neutral-350">Easier troubleshooting for your team.</span>
          </div>
          <button className="max-w-max font-medium text-sky-500 transition-colors hover:text-sky-600 group-hover:text-sky-400">
            More info <Icon iconName="angle-right" iconStyle="regular" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Background({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="375"
      height="96"
      fill="none"
      viewBox="0 0 375 96"
      className={className}
    >
      <g clipPath="url(#clip0_601_25203)">
        <path fill="#FFFEFF" d="M0 8a8 8 0 0 1 8-8h359a8 8 0 0 1 8 8v80a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8z"></path>
        <path fill="url(#paint0_linear_601_25203)" d="M0 0h208v96H0z"></path>
        <path
          fill="#642DFF"
          d="M-13.703 6.569a1.47 1.47 0 0 1 1.49.044L5.26 17.64a1.47 1.47 0 0 0 1.49.045L30.812 4.442c.468-.258.759-.749.76-1.283l.035-20.66c0-.533.291-1.024.76-1.282L43.665-25l-.06 34.776a2.93 2.93 0 0 1-1.519 2.565L7.39 31.434a2.93 2.93 0 0 1-2.98-.09L-25 12.787z"
          opacity="0.1"
        ></path>
        <g opacity="0.1">
          <path
            fill="#642DFF"
            d="M387.445 87.153a1.42 1.42 0 0 1-1.441-.065l-16.736-10.926a1.42 1.42 0 0 0-1.44-.065l-23.474 12.449a1.42 1.42 0 0 0-.753 1.228l-.343 19.983a1.42 1.42 0 0 1-.754 1.23l-11.021 5.845.577-33.637a2.84 2.84 0 0 1 1.507-2.458l33.846-17.95a2.84 2.84 0 0 1 2.881.13l28.171 18.391z"
          ></path>
          <path
            stroke="#642DFF"
            d="M387.445 87.153a1.42 1.42 0 0 1-1.441-.065l-16.736-10.926a1.42 1.42 0 0 0-1.44-.065l-23.474 12.449a1.42 1.42 0 0 0-.753 1.228l-.343 19.983a1.42 1.42 0 0 1-.754 1.23l-11.021 5.845.577-33.637a2.84 2.84 0 0 1 1.507-2.458l33.846-17.95a2.84 2.84 0 0 1 2.881.13l28.171 18.391z"
          ></path>
        </g>
        <path
          fill="#642DFF"
          d="M43.923 31.774c0 .404-.216.777-.567.978l-10.472 5.984c-.35.2-.567.573-.567.977v16.575c0 .404.217.777.567.977l10.472 5.983c.35.2.567.573.567.977V72L26.134 61.836A2.25 2.25 0 0 1 25 59.88V36.12c0-.809.433-1.555 1.134-1.956L43.924 24zM70.02 34.165a2.25 2.25 0 0 1 1.134 1.955v23.76c0 .809-.433 1.555-1.134 1.956L52.23 72v-7.775c0-.404.217-.777.568-.977l10.472-5.983c.35-.2.567-.574.567-.977V39.713c0-.404-.216-.777-.567-.977l-10.472-5.984c-.35-.2-.567-.574-.567-.978V24z"
        ></path>
        <path
          fill="#642DFF"
          stroke="#642DFF"
          strokeWidth="6.754"
          d="M44.553 49.984v-3.967l3.524-2.014 3.525 2.014v3.967l-3.525 2.014z"
        ></path>
      </g>
      <path
        stroke="#CACBFF"
        d="M8 .5h359a7.5 7.5 0 0 1 7.5 7.5v80a7.5 7.5 0 0 1-7.5 7.5H8A7.5 7.5 0 0 1 .5 88V8A7.5 7.5 0 0 1 8 .5Z"
      ></path>
      <mask id="path-9-inside-1_601_25203" fill="#fff">
        <path d="M0 8a8 8 0 0 1 8-8h359a8 8 0 0 1 8 8v80a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8z"></path>
      </mask>
      <path
        fill="url(#paint1_linear_601_25203)"
        d="M0 8a9 9 0 0 1 9-9h357a9 9 0 0 1 9 9c0-3.866-3.582-7-8-7H8C3.582 1 0 4.134 0 8m375 88H0zM0 96V0zM375 0v96z"
        mask="url(#path-9-inside-1_601_25203)"
      ></path>
      <mask id="path-11-inside-2_601_25203" fill="#fff">
        <path d="M0 8a8 8 0 0 1 8-8h359a8 8 0 0 1 8 8v80a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8z"></path>
      </mask>
      <path
        fill="url(#paint2_linear_601_25203)"
        d="M0 0h375zm375 88a9 9 0 0 1-9 9H9a9 9 0 0 1-9-9c0 3.866 3.582 7 8 7h359c4.418 0 8-3.134 8-7M0 96V0zM375 0v96z"
        mask="url(#path-11-inside-2_601_25203)"
      ></path>
      <defs>
        <linearGradient
          id="paint0_linear_601_25203"
          x1="-27.5"
          x2="208"
          y1="108"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B50D6" stopOpacity="0.15"></stop>
          <stop offset="0.46" stopColor="#847AE6" stopOpacity="0.1"></stop>
          <stop offset="1" stopColor="#847AE6" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="paint1_linear_601_25203" x1="368" x2="5.5" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B50D6" stopOpacity="0"></stop>
          <stop offset="0.647" stopColor="#5B50D6" stopOpacity="0.8"></stop>
          <stop offset="1" stopColor="#5B50D6" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient id="paint2_linear_601_25203" x1="368" x2="5.5" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0"></stop>
          <stop offset="0.158" stopColor="#fff" stopOpacity="0.8"></stop>
          <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
        </linearGradient>
        <clipPath id="clip0_601_25203">
          <path fill="#fff" d="M0 8a8 8 0 0 1 8-8h359a8 8 0 0 1 8 8v80a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8z"></path>
        </clipPath>
      </defs>
    </svg>
  )
}
