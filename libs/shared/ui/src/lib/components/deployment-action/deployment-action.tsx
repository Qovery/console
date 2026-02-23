import { ServiceActionStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { forwardRef } from 'react'
import { match } from 'ts-pattern'
import { twMerge } from '@qovery/shared/util-js'
import { type IconSVGProps } from '../icon/icon'

export const DeployIcon = forwardRef<SVGSVGElement, IconSVGProps>(function (
  { className = '', ...props },
  forwardedRef
) {
  return (
    <svg
      className={twMerge('text-neutral', className)}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_11565_331686)">
        <path
          d="M10.0697 7.24346C8.85324 8.06628 6.53512 9.1078 5.26671 9.64906L4.30994 8.69228C4.8676 7.43208 5.92825 5.13856 6.75107 3.92483C8.45139 1.42082 10.8925 1.14472 12.6229 1.37435C12.8553 3.10474 12.5764 5.54587 10.0724 7.24346H10.0697ZM3.24109 7.87219C3.14268 8.09089 3.0552 8.28771 2.98413 8.45173C2.84198 8.77703 2.91579 9.15427 3.16728 9.40576L4.55323 10.7917C4.80199 11.0405 5.17377 11.117 5.49633 10.9803C5.67402 10.9065 5.88724 10.8163 6.12507 10.7124V13.3422C6.12507 13.5773 6.25082 13.796 6.45584 13.9135C6.66086 14.0311 6.91236 14.0283 7.11465 13.9081L9.53391 12.4729C10.1326 12.1175 10.4989 11.4751 10.4989 10.7808V8.531C10.6082 8.46266 10.7094 8.39705 10.8078 8.33144C14.11 6.0926 14.2194 2.75757 13.8531 0.767483C13.7956 0.450382 13.5469 0.204355 13.2298 0.144215C11.2397 -0.222092 7.90466 -0.112747 5.66582 3.18948C5.60021 3.28789 5.53187 3.38904 5.46626 3.49838H3.22195C2.52761 3.49838 1.88247 3.86469 1.52983 4.46335L0.0946762 6.88262C-0.0256036 7.08491 -0.0283372 7.3364 0.089209 7.54143C0.206755 7.74645 0.422712 7.87219 0.657805 7.87219H3.24109ZM11.155 3.93576C11.155 3.64576 11.0398 3.36764 10.8347 3.16258C10.6296 2.95751 10.3515 2.84231 10.0615 2.84231C9.7715 2.84231 9.49338 2.95751 9.28831 3.16258C9.08325 3.36764 8.96805 3.64576 8.96805 3.93576C8.96805 4.22577 9.08325 4.50389 9.28831 4.70895C9.49338 4.91401 9.7715 5.02922 10.0615 5.02922C10.3515 5.02922 10.6296 4.91401 10.8347 4.70895C11.0398 4.50389 11.155 4.22577 11.155 3.93576Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_11565_331686">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export const RestartIcon = forwardRef<SVGSVGElement, IconSVGProps>(function (
  { className = '', ...props },
  forwardedRef
) {
  return (
    <svg
      className={twMerge('text-neutral', className)}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_11565_331734)">
        <path
          d="M1.35172 6.13103C0.990557 6.13103 0.699997 5.84047 0.699997 5.47931V1.56896C0.699997 1.2078 0.990557 0.917236 1.35172 0.917236C1.71288 0.917236 2.00345 1.2078 2.00345 1.56896V3.74409L2.54655 3.10594C3.65991 1.76991 5.34082 0.917236 7.21724 0.917236C10.5763 0.917236 13.3 3.6409 13.3 7C13.3 10.3591 10.5763 13.0828 7.21724 13.0828C5.84862 13.0828 4.58319 12.6293 3.56758 11.8662C3.27974 11.649 3.22271 11.2416 3.43724 10.9538C3.65176 10.6659 4.06181 10.6089 4.34965 10.8234C5.14801 11.4236 6.13918 11.7793 7.21724 11.7793C9.85672 11.7793 11.9965 9.63948 11.9965 7C11.9965 4.36051 9.85672 2.22069 7.21724 2.22069C5.74271 2.22069 4.42297 2.8887 3.54586 3.94232L3.54314 3.94776L2.79366 4.82758H5.26207C5.62323 4.82758 5.91379 5.11814 5.91379 5.47931C5.91379 5.84047 5.62323 6.13103 5.26207 6.13103H1.35172Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_11565_331734">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export const DeleteIcon = forwardRef<SVGSVGElement, IconSVGProps>(function (
  { className = '', ...props },
  forwardedRef
) {
  return (
    <svg
      className={twMerge('text-neutral', className)}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_11213_9358)">
        <path
          d="M5.53711 1.41094L5.01758 2.1875H8.98242L8.46289 1.41094C8.42188 1.35078 8.35352 1.3125 8.27969 1.3125H5.71758C5.64375 1.3125 5.57539 1.34805 5.53437 1.41094H5.53711ZM9.55664 0.683594L10.5602 2.1875H10.9375H12.25H12.4688C12.8324 2.1875 13.125 2.48008 13.125 2.84375C13.125 3.20742 12.8324 3.5 12.4688 3.5H12.25V11.8125C12.25 13.0211 11.2711 14 10.0625 14H3.9375C2.72891 14 1.75 13.0211 1.75 11.8125V3.5H1.53125C1.16758 3.5 0.875 3.20742 0.875 2.84375C0.875 2.48008 1.16758 2.1875 1.53125 2.1875H1.75H3.0625H3.43984L4.44336 0.680859C4.72773 0.257031 5.20625 0 5.71758 0H8.27969C8.79102 0 9.26953 0.257031 9.55391 0.680859L9.55664 0.683594ZM3.0625 3.5V11.8125C3.0625 12.2965 3.45352 12.6875 3.9375 12.6875H10.0625C10.5465 12.6875 10.9375 12.2965 10.9375 11.8125V3.5H3.0625ZM5.25 5.25V10.9375C5.25 11.1781 5.05313 11.375 4.8125 11.375C4.57187 11.375 4.375 11.1781 4.375 10.9375V5.25C4.375 5.00937 4.57187 4.8125 4.8125 4.8125C5.05313 4.8125 5.25 5.00937 5.25 5.25ZM7.4375 5.25V10.9375C7.4375 11.1781 7.24063 11.375 7 11.375C6.75937 11.375 6.5625 11.1781 6.5625 10.9375V5.25C6.5625 5.00937 6.75937 4.8125 7 4.8125C7.24063 4.8125 7.4375 5.00937 7.4375 5.25ZM9.625 5.25V10.9375C9.625 11.1781 9.42813 11.375 9.1875 11.375C8.94687 11.375 8.75 11.1781 8.75 10.9375V5.25C8.75 5.00937 8.94687 4.8125 9.1875 4.8125C9.42813 4.8125 9.625 5.00937 9.625 5.25Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_11213_9358">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export const StopIcon = forwardRef<SVGSVGElement, IconSVGProps>(function ({ className = '', ...props }, forwardedRef) {
  return (
    <svg
      className={twMerge('text-neutral', className)}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_11213_9374)">
        <path
          d="M12.6875 7C12.6875 5.49158 12.0883 4.04494 11.0217 2.97833C9.95506 1.91172 8.50842 1.3125 7 1.3125C5.49158 1.3125 4.04494 1.91172 2.97833 2.97833C1.91172 4.04494 1.3125 5.49158 1.3125 7C1.3125 8.50842 1.91172 9.95506 2.97833 11.0217C4.04494 12.0883 5.49158 12.6875 7 12.6875C8.50842 12.6875 9.95506 12.0883 11.0217 11.0217C12.0883 9.95506 12.6875 8.50842 12.6875 7ZM0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7ZM5.25 4.375H8.75C9.23398 4.375 9.625 4.76602 9.625 5.25V8.75C9.625 9.23398 9.23398 9.625 8.75 9.625H5.25C4.76602 9.625 4.375 9.23398 4.375 8.75V5.25C4.375 4.76602 4.76602 4.375 5.25 4.375Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_11213_9374">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export const getDeploymentAction = (status: StateEnum | ServiceActionStatusEnum | undefined) => {
  return match(status)
    .with(
      StateEnum.QUEUED,
      StateEnum.WAITING_RUNNING,
      StateEnum.DEPLOYING,
      StateEnum.DEPLOYED,
      StateEnum.DEPLOYMENT_ERROR,
      StateEnum.DEPLOYMENT_QUEUED,
      // Other states categorized as "deploy"
      StateEnum.BUILDING,
      StateEnum.BUILD_ERROR,
      StateEnum.CANCELING,
      StateEnum.CANCELED,
      StateEnum.EXECUTING,
      StateEnum.READY,
      StateEnum.RECAP,
      undefined,
      () => ({
        status: 'Deploy',
        icon: <DeployIcon />,
      })
    )
    .with(
      StateEnum.RESTARTED,
      StateEnum.RESTARTING,
      StateEnum.RESTART_ERROR,
      StateEnum.RESTART_QUEUED,
      StateEnum.WAITING_RESTARTING,
      () => ({
        status: 'Restart',
        icon: <RestartIcon />,
      })
    )
    .with(
      StateEnum.DELETED,
      StateEnum.DELETE_ERROR,
      StateEnum.DELETE_QUEUED,
      StateEnum.DELETING,
      StateEnum.WAITING_DELETING,
      () => ({
        status: 'Delete',
        icon: <DeleteIcon />,
      })
    )
    .with(
      StateEnum.STOPPED,
      StateEnum.STOPPING,
      StateEnum.STOP_ERROR,
      StateEnum.STOP_QUEUED,
      StateEnum.WAITING_STOPPING,
      () => ({
        status: 'Stop',
        icon: <StopIcon />,
      })
    )
    .with(
      ServiceActionStatusEnum.ONGOING,
      ServiceActionStatusEnum.SUCCESS,
      ServiceActionStatusEnum.ERROR,
      ServiceActionStatusEnum.NEVER,
      () => ({
        status: 'Deploy',
        icon: <DeployIcon />,
      })
    )
    .exhaustive()
}

export const DeploymentAction = ({ status }: { status: StateEnum | ServiceActionStatusEnum | undefined }) => {
  const action = getDeploymentAction(status)
  if (!status || !action) return null

  return (
    <div className="flex items-center gap-2">
      {action.icon}
      <span className="text-neutral">{action.status}</span>
    </div>
  )
}
