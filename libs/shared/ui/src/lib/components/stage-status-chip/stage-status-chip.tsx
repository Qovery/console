import { type StageStatusEnum, type StepMetricStatusEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import Icon from '../icon/icon'
import Skeleton from '../skeleton/skeleton'
import Tooltip from '../tooltip/tooltip'

export interface StageStatusChipProps {
  status: keyof typeof StageStatusEnum | keyof typeof StepMetricStatusEnum | undefined
  className?: string
}

export function StageStatusChip({ status, className = '' }: StageStatusChipProps) {
  if (!status) {
    return (
      <Skeleton width={24} height={24}>
        <div className={className}></div>
      </Skeleton>
    )
  }

  const icon = match(status)
    .with('SKIPPED', 'SKIP', () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          className="fill-neutral-100 stroke-neutral-250 dark:fill-neutral-650 dark:stroke-neutral-400"
          d="M1.5 8.993v0c0-.91.23-1.804.669-2.591A5.098 5.098 0 013.99 4.507s0 0 0 0L9.49 1.2h0a4.863 4.863 0 012.508-.7 4.864 4.864 0 012.51.7l5.5 3.31h0a5.097 5.097 0 011.82 1.892c.439.787.67 1.68.671 2.59v6.015c0 .91-.23 1.804-.669 2.591a5.097 5.097 0 01-1.822 1.895l-5.5 3.307h0c-.763.459-1.628.7-2.508.7-.88 0-1.746-.241-2.51-.7 0 0 0 0 0 0l-5.5-3.31h0a5.098 5.098 0 01-1.82-1.892 5.333 5.333 0 01-.671-2.589V8.993z"
        ></path>
        <path
          fill="#A0AFC5"
          d="M6.91 16.241a.44.44 0 00.693.36l6.009-4.241a.44.44 0 000-.72L7.603 7.4a.44.44 0 00-.693.359v8.482zm8.924-9.331a.44.44 0 00-.44.44v9.3c0 .244.197.44.44.44h.817a.44.44 0 00.44-.44v-9.3a.44.44 0 00-.44-.44h-.817z"
        ></path>
      </svg>
    ))
    .with('QUEUED', () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          stroke="#847AE6"
          d="M1.5 8.993v0c0-.91.23-1.804.669-2.591A5.098 5.098 0 013.99 4.507s0 0 0 0L9.49 1.2h0a4.863 4.863 0 012.508-.7 4.864 4.864 0 012.51.7l5.5 3.31h0a5.097 5.097 0 011.82 1.892c.439.787.67 1.68.671 2.59v6.015c0 .91-.23 1.804-.669 2.591a5.097 5.097 0 01-1.822 1.895l-5.5 3.307h0c-.763.459-1.628.7-2.508.7-.88 0-1.746-.241-2.51-.7 0 0 0 0 0 0l-5.5-3.31h0a5.098 5.098 0 01-1.82-1.892 5.333 5.333 0 01-.671-2.589V8.993z"
        ></path>
        <g clipPath="url(#clip0_9487_5796)">
          <g clipPath="url(#clip1_9487_5796)">
            <path
              fill="#847AE6"
              d="M17.375 12a5.375 5.375 0 10-10.75 0 5.375 5.375 0 0010.75 0zm-11.99 0a6.615 6.615 0 1113.23 0 6.615 6.615 0 01-13.23 0zm7.235-3.514V12c0 .207-.103.4-.276.517L9.863 14.17a.619.619 0 01-.86-.174.618.618 0 01.173-.86l2.204-1.468V8.486c0-.344.276-.62.62-.62s.62.276.62.62z"
            ></path>
          </g>
        </g>
        <defs>
          <clipPath id="clip0_9487_5796">
            <path fill="#fff" d="M0 0H14V14H0z" transform="translate(5 5)"></path>
          </clipPath>
          <clipPath id="clip1_9487_5796">
            <path fill="#fff" d="M0 0H14V14H0z" transform="translate(5 5)"></path>
          </clipPath>
        </defs>
      </svg>
    ))
    .with('ONGOING', () => (
      <span className="relative flex h-6 w-6 items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
          <path
            fill="#5B50D6"
            stroke="#847AE6"
            d="M.5 8.993v0c0-.91.23-1.804.669-2.591A5.098 5.098 0 012.99 4.507s0 0 0 0L8.49 1.2h0a4.864 4.864 0 012.508-.7 4.864 4.864 0 012.51.7l5.5 3.31h0a5.097 5.097 0 011.82 1.892c.439.787.67 1.68.671 2.59v6.015c0 .91-.23 1.804-.669 2.591a5.097 5.097 0 01-1.822 1.895l-5.5 3.307h0c-.763.459-1.628.7-2.508.7-.88 0-1.746-.241-2.51-.7 0 0 0 0 0 0l-5.5-3.31h0a5.098 5.098 0 01-1.82-1.892A5.333 5.333 0 01.5 15.009V8.993z"
          ></path>
        </svg>
        <span
          aria-label="loading"
          className="absolute left-0 top-0 flex h-full w-full animate-spin items-center justify-center text-neutral-50"
        >
          <Icon iconName="loader" />
        </span>
      </span>
    ))
    .with('DONE', 'SUCCESS', () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          fill="#44C979"
          stroke="#31AC6F"
          d="M1.5 8.993v0c0-.91.23-1.804.669-2.591A5.098 5.098 0 013.99 4.507s0 0 0 0L9.49 1.2h0a4.863 4.863 0 012.508-.7 4.864 4.864 0 012.51.7l5.5 3.31h0a5.097 5.097 0 011.82 1.892c.439.787.67 1.68.671 2.59v6.015c0 .91-.23 1.804-.669 2.591a5.097 5.097 0 01-1.822 1.895l-5.5 3.307h0c-.763.459-1.628.7-2.508.7-.88 0-1.746-.241-2.51-.7 0 0 0 0 0 0l-5.5-3.31h0a5.098 5.098 0 01-1.82-1.892 5.333 5.333 0 01-.671-2.589V8.993z"
        ></path>
        <path
          className="fill-neutral-50 dark:fill-neutral-700"
          fillRule="evenodd"
          d="M10.138 16.337l7.533-7.143-1.582-1.495-5.955 5.644-2.978-2.822-1.577 1.495 4.56 4.32z"
          clipRule="evenodd"
        ></path>
      </svg>
    ))
    .with('CANCELED', 'CANCEL', () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          className="fill-neutral-100 stroke-neutral-250 dark:fill-neutral-650 dark:stroke-neutral-400"
          d="M1.5 8.993c0-.91.23-1.804.669-2.591A5.1 5.1 0 0 1 3.99 4.507L9.49 1.2a4.86 4.86 0 0 1 2.508-.7 4.86 4.86 0 0 1 2.51.7l5.5 3.31a5.1 5.1 0 0 1 1.82 1.892c.439.787.67 1.68.671 2.59v6.015c0 .91-.23 1.804-.669 2.591a5.1 5.1 0 0 1-1.822 1.895l-5.5 3.307c-.763.459-1.628.7-2.508.7s-1.746-.241-2.51-.7l-5.5-3.31a5.1 5.1 0 0 1-1.82-1.892 5.33 5.33 0 0 1-.671-2.589V8.993Z"
        ></path>
        <path
          fill="#A0AFC5"
          d="M16.743 8.988a.364.364 0 0 0 0-.514l-1.217-1.217a.364.364 0 0 0-.514 0l-2.755 2.755a.364.364 0 0 1-.514 0L8.988 7.257a.364.364 0 0 0-.514 0L7.257 8.474a.364.364 0 0 0 0 .514l2.755 2.755a.364.364 0 0 1 0 .514l-2.755 2.755a.364.364 0 0 0 0 .514l1.217 1.217a.364.364 0 0 0 .514 0l2.755-2.754a.364.364 0 0 1 .514 0l2.755 2.754a.364.364 0 0 0 .514 0l1.217-1.217a.364.364 0 0 0 0-.514l-2.754-2.755a.364.364 0 0 1 0-.514z"
        ></path>
      </svg>
    ))
    .with('ERROR', () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          fill="#FF6240"
          stroke="#DB402E"
          d="M1.5 8.993v0c0-.91.23-1.804.669-2.591A5.098 5.098 0 013.99 4.507s0 0 0 0L9.49 1.2h0a4.863 4.863 0 012.508-.7 4.864 4.864 0 012.51.7l5.5 3.31h0a5.097 5.097 0 011.82 1.892c.439.787.67 1.68.671 2.59v6.015c0 .91-.23 1.804-.669 2.591a5.097 5.097 0 01-1.822 1.895l-5.5 3.307h0c-.763.459-1.628.7-2.508.7-.88 0-1.746-.241-2.51-.7 0 0 0 0 0 0l-5.5-3.31h0a5.098 5.098 0 01-1.82-1.892 5.333 5.333 0 01-.671-2.589V8.993z"
        ></path>
        <path
          fill="#fff"
          d="M12.85 6.375H11.4a.4.4 0 00-.4.4v6.7c0 .22.18.4.4.4h1.45a.4.4 0 00.4-.4v-6.7a.4.4 0 00-.4-.4zM11 15.775v1.45c0 .22.18.4.4.4h1.45a.4.4 0 00.4-.4v-1.45a.4.4 0 00-.4-.4H11.4a.4.4 0 00-.4.4z"
        ></path>
      </svg>
    ))
    .exhaustive()

  return (
    <Tooltip content={upperCaseFirstLetter(status)}>
      <div className={className}>{icon}</div>
    </Tooltip>
  )
}

export default StageStatusChip
