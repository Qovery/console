import Spinner from '../spinner/spinner'

export function LoadingScreen() {
  return (
    <div className="bg-element-light-lighter-400 h-screen flex items-center justify-center">
      <Spinner />
    </div>
  )
}

export default LoadingScreen
