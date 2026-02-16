export interface LoaderSpinnerProps {
  className?: string
  classWidth?: string
  classBorder?: string
}

export function LoaderSpinner(props: LoaderSpinnerProps) {
  const { className = '', classWidth = 'w-4', classBorder = 'border-2' } = props

  return (
    <div
      data-testid="spinner"
      className={`aspect-square ${classBorder || 'border-2'}  animate-spin rounded-full border-solid border-neutral border-r-neutral-strong ${
        classWidth || 'w-4'
      } ${className || ''}`}
    />
  )
}

export default LoaderSpinner
