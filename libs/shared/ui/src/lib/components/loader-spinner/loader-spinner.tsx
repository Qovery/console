export interface LoaderSpinnerProps {
  className?: string
  classWidth?: string
  classBorder?: string
  theme?: 'dark' | 'light'
}

export function LoaderSpinner(props: LoaderSpinnerProps) {
  const { className = '', classWidth = 'w-4', classBorder = 'border-2', theme = 'light' } = props
  const themeClasses =
    theme === 'dark'
      ? 'border-element-light-lighter-700 border-r-element-light-lighter-100'
      : 'border-r-element-light-darker-100'

  return (
    <div
      data-testid="spinner"
      className={`aspect-square ${classBorder || 'border-2'}  rounded-full border-solid ${themeClasses} animate-spin ${
        classWidth || 'w-4'
      } ${className || ''}`}
    />
  )
}

export default LoaderSpinner
