import { type ScatterProps } from 'recharts'

export interface EventIconProps {
  cx: number
  cy: number
}

// SVG Icons for different event types
export const EventIcons = {
  deployment: ({ cx, cy }: EventIconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x={cx - 10}
      y={cy - 10}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path fill="#5B50D6" d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10" />
      <g clipPath="url(#clip0_25098_158990)">
        <path
          fill="#fff"
          d="M7.46 4.915a1.127 1.127 0 0 0-1.71.96v8.25a1.127 1.127 0 0 0 1.71.96l6.75-4.124a1.125 1.125 0 0 0 0-1.922z"
        />
      </g>
      <defs>
        <clipPath id="clip0_25098_158990">
          <path fill="#fff" d="M4 4h12v12H4z" />
        </clipPath>
      </defs>
    </svg>
  ),
  error: ({ cx, cy }: EventIconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x={cx - 10}
      y={cy - 10}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path fill="#FF6240" d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10" />
      <g clipPath="url(#clip0_25163_80956)">
        <path
          fill="#fff"
          d="M7.938 5.875a.56.56 0 0 0-.563.563v7.125c0 .196-.033.386-.096.562h7.034c.311 0 .562-.25.562-.562V6.437a.56.56 0 0 0-.562-.562zm-2.25 9.375A1.686 1.686 0 0 1 4 13.563V6.625c0-.312.25-.562.563-.562.311 0 .562.25.562.562v6.938c0 .311.25.562.563.562.311 0 .562-.25.562-.562V6.437c0-.932.755-1.687 1.688-1.687h6.375c.932 0 1.687.755 1.687 1.688v7.125c0 .932-.755 1.687-1.687 1.687zm2.437-8.062c0-.312.25-.563.563-.563h2.25c.311 0 .562.25.562.563v1.875c0 .311-.25.562-.562.562h-2.25a.56.56 0 0 1-.563-.562zm4.688-.563h.75c.311 0 .562.25.562.563 0 .311-.25.562-.562.562h-.75a.56.56 0 0 1-.563-.562c0-.312.25-.563.563-.563m0 1.875h.75c.311 0 .562.25.562.563 0 .311-.25.562-.562.562h-.75a.56.56 0 0 1-.563-.562c0-.312.25-.563.563-.563m-4.126 1.875h4.876c.311 0 .562.25.562.563 0 .311-.25.562-.562.562H8.686a.56.56 0 0 1-.562-.562c0-.312.25-.563.563-.563m0 1.875h4.876c.311 0 .562.25.562.563 0 .311-.25.562-.562.562H8.686a.56.56 0 0 1-.562-.562c0-.312.25-.563.563-.563"
        />
      </g>
      <defs>
        <clipPath id="clip0_25163_80956">
          <path fill="#fff" d="M4 4h12v12H4z" />
        </clipPath>
      </defs>
    </svg>
  ),
}

// Helper function to get icon based on event type
export function getEventIcon(type: 'deployment' | 'error') {
  return EventIcons[type]
}

// Helper function to create scatter shape from event type
export function createEventShape(type: 'deployment' | 'error') {
  return (props: ScatterProps) => {
    const cx = Number(props.cx ?? 0)
    const cy = Number(props.cy ?? 0)
    return getEventIcon(type)({ cx, cy })
  }
}
