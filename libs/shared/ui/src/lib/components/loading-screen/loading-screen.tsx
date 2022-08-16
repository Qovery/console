import LoaderSpinner from '../loader-spinner/loader-spinner'

export function LoadingScreen() {
  return (
    <div className="bg-element-light-lighter-400 h-screen flex items-center justify-center">
      <LoaderSpinner />
    </div>
  )
}

export default LoadingScreen
