import { type SVGAttributes } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export function CompletionPartyHornIllustration({ className, ...props }: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      className={twMerge('h-36 w-full overflow-hidden', className)}
      viewBox="0 0 488 148"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <mask
          id="completion-party-horn-pattern-mask"
          maskUnits="userSpaceOnUse"
          x="-18"
          y="-5"
          width="529"
          height="153"
          style={{ maskType: 'alpha' }}
        >
          <rect x="-18" y="-5" width="529" height="153" fill="url(#completion-party-horn-paint-0)" />
          <rect x="-18" y="-5" width="529" height="153" fill="url(#completion-party-horn-paint-1)" />
          <rect x="-18" y="-5" width="529" height="153" fill="url(#completion-party-horn-paint-2)" />
          <rect x="-18" y="-5" width="529" height="153" fill="url(#completion-party-horn-paint-3)" />
          <rect x="-18" y="-5" width="529" height="153" fill="url(#completion-party-horn-paint-4)" />
        </mask>
        <radialGradient
          id="completion-party-horn-paint-0"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(8.13334 88) rotate(35.743) scale(102.713 57.3123)"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-1"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-45.5 63.5 -109.592 -10.0666 136 10.5)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-2"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(432.5 7.5) rotate(139.764) scale(93.6617 109.413)"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="0.931262" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-3"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-32.5333 55.5 -9.70457 -51.6187 488 45.5)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-4"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(267.5 -53.5) rotate(69.1748) scale(87.1966 148.017)"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
        <filter
          id="completion-party-horn-shadow"
          x="-4.21224"
          y="-4.33333"
          width="72.6081"
          height="72.6087"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2.66667" />
          <feComposite in2="hardAlpha" operator="out" result="outerShadowAlpha" />
          <feFlood floodColor="currentColor" floodOpacity="0.2" result="outerShadowColor" />
          <feComposite in="outerShadowColor" in2="outerShadowAlpha" operator="in" result="outerShadow" />
          <feBlend mode="normal" in="outerShadow" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlphaInnerDark"
          />
          <feOffset dy="-1.33333" />
          <feGaussianBlur stdDeviation="1.33333" />
          <feComposite in2="hardAlphaInnerDark" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlphaInnerLight"
          />
          <feOffset dy="1.33333" />
          <feGaussianBlur stdDeviation="0.666667" />
          <feComposite in2="hardAlphaInnerLight" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="effect2_innerShadow" result="effect3_innerShadow" />
        </filter>
      </defs>

      <g mask="url(#completion-party-horn-pattern-mask)">
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(-2.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(7.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(18.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(39.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(49.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(70.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(81.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(91.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(112.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(123.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(133.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(154.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(165.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(175.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(186.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(196.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(207.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(217.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(228.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(238.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(249.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(259.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(270.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(280.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(291.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(301.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(322.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(333.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(343.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(354.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(364.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(375.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(385.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(396.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(406.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(417.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(427.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(448.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(459.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(469.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(480.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(490.75 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(501.25 -5)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-8 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(2.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(13 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(23.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(34 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(44.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(55 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(65.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(76 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(86.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(97 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(107.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(118 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(128.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(139 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(160 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(170.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(181 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(191.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(202 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(212.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(223 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(233.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(244 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(254.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(265 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(275.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(286 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(296.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(307 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(317.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(328 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(338.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(349 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(359.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(370 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(380.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(391 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(401.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(412 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(422.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(433 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(443.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(454 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(464.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(475 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(485.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(496 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(506.5 4)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(-2.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(7.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(18.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(39.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(49.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(70.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(81.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(91.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(112.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(123.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(133.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(154.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(165.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(175.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(186.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(196.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(207.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(217.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(228.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(238.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(249.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(259.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(270.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(280.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(291.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(301.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(312.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(322.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(333.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(343.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(354.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(364.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(375.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(385.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(396.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(406.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(417.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(427.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(448.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(459.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(469.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(480.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(490.75 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(501.25 13)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-8 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(2.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(13 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(23.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(34 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(44.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(55 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(65.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(76 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(86.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(97 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(107.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(118 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(128.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(139 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(160 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(170.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(181 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(191.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(202 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(212.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(223 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(233.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(244 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(254.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(265 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(275.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(286 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(296.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(307 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(317.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(328 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(338.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(349 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(359.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(370 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(380.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(391 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(401.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(412 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(422.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(433 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(443.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(454 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(464.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(475 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(485.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(496 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(506.5 22)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-2.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(7.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(18.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(39.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(49.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(70.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(81.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(91.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(112.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(123.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(133.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(154.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(165.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(175.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(186.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(196.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(207.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(217.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(228.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(238.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(249.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(259.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(270.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(280.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(291.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(301.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(322.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(333.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(343.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(354.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(364.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(375.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(385.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(396.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(406.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(417.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(427.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(448.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(459.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(469.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(480.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(490.75 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(501.25 31)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-8 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(2.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(13 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(23.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(34 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(44.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(55 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(65.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(76 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(86.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(97 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(107.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(118 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(128.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(139 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(160 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(170.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(181 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(191.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(202 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(212.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(223 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(233.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(244 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(254.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(265 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(275.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(286 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(296.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(307 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(317.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(328 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(338.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(349 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(359.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(370 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(380.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(391 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(401.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(412 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(422.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(433 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(443.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(454 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(464.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(475 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(485.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(496 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(506.5 40)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(-2.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(7.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(18.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(39.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(49.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(70.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(81.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(91.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(112.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(123.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(133.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(154.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(165.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(175.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(186.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(196.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(207.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(217.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(228.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(238.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(249.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(259.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(270.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(280.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(291.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(301.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(322.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(333.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(343.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(354.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(364.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(375.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(385.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(396.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(406.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(417.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(427.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(448.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(459.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(469.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(480.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(490.75 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(501.25 49)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(-8 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(2.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(13 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(23.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(34 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(44.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(55 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(65.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(76 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(86.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(97 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(107.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(118 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(128.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(139 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(160 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(170.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(181 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(191.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(202 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(212.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(223 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(233.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(244 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(254.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(265 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(275.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(286 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(296.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(307 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(317.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(328 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(338.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(349 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(359.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(370 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(380.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(391 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(401.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(412 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(422.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(433 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(443.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(454 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(464.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(475 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(485.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(496 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(506.5 58)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(-2.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(7.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(18.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(39.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(49.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(70.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(81.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(91.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(112.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(123.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(133.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(154.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(165.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(175.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(186.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(196.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(207.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(217.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(228.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(238.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(249.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(259.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(270.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(280.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(291.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(301.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(322.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(333.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(343.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(354.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(364.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(375.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(385.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(396.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(406.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(417.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(427.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(448.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(459.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(469.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(480.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(490.75 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(501.25 67)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-8 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(2.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(13 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(23.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(34 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(44.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(55 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(65.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(76 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(86.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(97 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(107.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(118 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(128.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(139 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(160 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(170.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(181 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(191.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(202 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(212.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(223 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(233.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(244 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(254.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(265 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(275.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(286 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(296.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(307 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(317.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(328 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(338.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(349 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(359.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(370 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(380.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(391 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(401.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(412 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(422.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(433 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(443.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(454 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(464.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(475 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(485.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(496 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(506.5 76)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-2.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(7.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(18.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(39.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(49.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(70.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(81.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(91.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(112.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(123.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(133.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(154.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(165.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(175.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(186.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(196.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(207.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(217.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(228.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(238.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(249.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(259.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(270.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(280.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(291.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(301.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(322.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(333.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(343.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(354.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(364.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(375.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(385.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(396.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(406.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(417.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(427.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(448.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(459.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(469.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(480.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(490.75 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(501.25 85)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-8 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(2.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(13 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(23.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(34 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(44.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(55 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(65.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(76 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(86.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(97 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(107.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(118 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(128.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(139 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(160 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(170.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(181 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(191.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(202 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(212.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(223 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(233.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(244 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(254.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(265 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(275.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(286 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(296.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(307 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(317.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(328 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(338.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(349 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(359.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(370 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(380.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(391 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(401.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(412 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(422.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(433 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(443.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(454 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(464.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(475 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(485.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(496 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(506.5 94)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(-2.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(7.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(18.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(39.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(49.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(70.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(81.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(91.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(112.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(123.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(133.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(154.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(165.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(175.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(186.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(196.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(207.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(217.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(228.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(238.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(249.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(259.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(270.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(280.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(291.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(301.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(322.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(333.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(343.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(354.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(364.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(375.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(385.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(396.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(406.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(417.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(427.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(448.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(459.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(469.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(480.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(490.75 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(501.25 103)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-8 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(2.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(13 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(23.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(34 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(44.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(55 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(65.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(76 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(86.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(97 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(107.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(118 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(128.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(139 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(160 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(170.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(181 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(191.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(202 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(212.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(223 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(233.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(244 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(254.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(265 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(275.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(286 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(296.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(307 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(317.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(328 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(338.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(349 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(359.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(370 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(380.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(391 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(401.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(412 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(422.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(433 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(443.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(454 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(464.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(475 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(485.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(496 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(506.5 112)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-2.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(7.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(18.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(39.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(49.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(60.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(70.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(81.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(91.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(102.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(112.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(123.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(133.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(154.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(165.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(175.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(186.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(196.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(207.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(217.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(228.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(238.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(249.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(259.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(270.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(280.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(291.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(301.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(322.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(333.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(343.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(354.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(364.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(375.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(385.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(396.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(406.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(417.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(427.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(438.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(448.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(459.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(469.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(480.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(490.75 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(501.25 121)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-8 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(2.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(13 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(23.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(34 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(44.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(55 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(65.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(76 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(86.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(97 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(107.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(118 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(128.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(139 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(149.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(160 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(170.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(181 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(191.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(202 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(212.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(223 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(233.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(244 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(254.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(265 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(275.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(286 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(296.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(307 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(317.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(328 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(338.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(349 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-9)"
          transform="translate(359.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(370 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(380.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(391 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(401.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(412 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(422.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(433 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(443.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(454 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(464.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(475 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(485.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(496 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(506.5 130)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-13.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(-2.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(7.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(18.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(28.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(39.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(49.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(60.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(70.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(81.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(91.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(102.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(112.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(123.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(133.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(144.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(154.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(165.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(175.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(186.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(196.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(207.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(217.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(228.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(238.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(249.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(259.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(270.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(280.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(291.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(301.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(312.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(322.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(333.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(343.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(354.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(364.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(375.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(385.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(396.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(406.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(417.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(427.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(438.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(448.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(459.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(469.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(480.25 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-3)"
          transform="translate(490.75 139)"
        />
        <path
          d="M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z"
          fill="var(--positive-6)"
          transform="translate(501.25 139)"
        />
      </g>

      <g className="text-positive" filter="url(#completion-party-horn-shadow)" transform="translate(212 42)">
        <path
          d="M5.06256 4C5.06256 3.20435 5.37863 2.44129 5.94124 1.87868C6.50385 1.31607 7.26691 1 8.06256 1C8.85821 1 9.62128 1.31607 10.1839 1.87868C10.7465 2.44129 11.0626 3.20435 11.0626 4C11.0626 4.79565 10.7465 5.55871 10.1839 6.12132C9.62128 6.68393 8.85821 7 8.06256 7C7.26691 7 6.50385 6.68393 5.94124 6.12132C5.37863 5.55871 5.06256 4.79565 5.06256 4ZM57.0626 20C57.0626 19.2044 57.3786 18.4413 57.9412 17.8787C58.5039 17.3161 59.2669 17 60.0626 17C60.8582 17 61.6213 17.3161 62.1839 17.8787C62.7465 18.4413 63.0626 19.2044 63.0626 20C63.0626 20.7957 62.7465 21.5587 62.1839 22.1213C61.6213 22.6839 60.8582 23 60.0626 23C59.2669 23 58.5039 22.6839 57.9412 22.1213C57.3786 21.5587 57.0626 20.7957 57.0626 20ZM60.0626 53C60.8582 53 61.6213 53.3161 62.1839 53.8787C62.7465 54.4413 63.0626 55.2044 63.0626 56C63.0626 56.7957 62.7465 57.5587 62.1839 58.1213C61.6213 58.6839 60.8582 59 60.0626 59C59.2669 59 58.5039 58.6839 57.9412 58.1213C57.3786 57.5587 57.0626 56.7957 57.0626 56C57.0626 55.2044 57.3786 54.4413 57.9412 53.8787C58.5039 53.3161 59.2669 53 60.0626 53ZM59.4751 4.5875C60.2501 5.3625 60.2501 6.6375 59.4751 7.4125L57.1001 9.7875C55.6876 11.2 53.7626 12 51.7626 12H50.3876C48.6376 12 47.4126 13.7125 47.9626 15.3625C49.3751 19.6125 46.2126 24 41.7376 24H40.3626C39.4251 24 38.5126 24.375 37.8501 25.0375L35.4751 27.4125C34.7001 28.1875 33.4251 28.1875 32.6501 27.4125C31.8751 26.6375 31.8751 25.3625 32.6501 24.5875L35.0251 22.2125C36.4376 20.8 38.3626 20 40.3626 20H41.7376C43.4876 20 44.7126 18.2875 44.1626 16.6375C42.7501 12.3875 45.9126 8 50.3876 8H51.7626C52.7001 8 53.6126 7.625 54.2751 6.9625L56.6501 4.5875C57.4251 3.8125 58.7001 3.8125 59.4751 4.5875ZM30.0626 4V7.025C30.0626 10.7375 28.5876 14.3 25.9626 16.925L23.4751 19.4125C22.7001 20.1875 21.4251 20.1875 20.6501 19.4125C19.8751 18.6375 19.8751 17.3625 20.6501 16.5875L23.1376 14.1C25.0126 12.225 26.0626 9.675 26.0626 7.025V4C26.0626 2.9 26.9626 2 28.0626 2C29.1626 2 30.0626 2.9 30.0626 4ZM11.1626 26.5375C12.0626 23.675 15.6876 22.7875 17.8001 24.9125L39.1501 46.2625C41.2751 48.3875 40.3876 52 37.5251 52.9L6.33756 62.75C3.25006 63.725 0.337565 60.825 1.31256 57.725L11.1626 26.5375ZM36.3126 49.0875L14.9751 27.75L12.9751 34.0875L13.4751 34.5875L29.4751 50.5875L29.9751 51.0875L36.3126 49.0875ZM25.6751 52.45L11.6126 38.3875L9.12506 46.25L9.46256 46.5875L17.4626 54.5875L17.8001 54.925L25.6626 52.4375L25.6751 52.45ZM5.12506 58.9375L13.5126 56.2875L7.77506 50.55L5.12506 58.9375ZM62.0626 36C62.0626 37.1 61.1626 38 60.0626 38H57.0376C54.3876 38 51.8376 39.05 49.9626 40.925L47.4751 43.4125C46.7001 44.1875 45.4251 44.1875 44.6501 43.4125C43.8751 42.6375 43.8751 41.3625 44.6501 40.5875L47.1376 38.1C49.7626 35.475 53.3251 34 57.0376 34H60.0626C61.1626 34 62.0626 34.9 62.0626 36Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
