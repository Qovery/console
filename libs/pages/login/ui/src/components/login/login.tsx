import { Icon, IconEnum } from '@console/shared-ui'
interface ILoginProps {
  authLogin: (provider: string) => void
}

export function Login(props: ILoginProps) {
  const { authLogin } = props

  return (
    <div className="flex h-full">
      <div className="flex-[2_1_0%] px-20">
        <div className="max-w-lg mt-28 mx-auto">
          <h1 className="h3 text-text-700 mb-3">Welcome to Qovery</h1>
          <p className="text-sm mb-10 text-text-500">
            By registering and using Qovery, you agree to the processing of your personal data by Qovery as described in
            the
            <a href="/" className="link text-accent2-500 ml-1">
              Privacy Policy
            </a>
            .
          </p>
          <button className="btn-login btn-login--github mb-3" onClick={() => authLogin('github')}>
            <Icon className="absolute left-3" width="20" name={IconEnum.GITHUB} />
            Sign in with Github
          </button>
          <button className="btn-login btn-login--default mb-3" onClick={() => authLogin('Gitlab')}>
            <Icon className="absolute left-3" width="20" name={IconEnum.GITLAB} />
            Sign in with Gitlab
          </button>
          <button className="btn-login btn-login--default mb-3" onClick={() => authLogin('bitbucket')}>
            <Icon className="absolute left-3" width="20" name={IconEnum.BITBUCKET} />
            Sign in with Bitbucket
          </button>
        </div>
      </div>
      <div className="flex-[1_1_0%] bg-element-light-lighter-300 px-20">
        <div className="max-w-md">
          <h2 className="h1 text-text-700 mt-44 mb-6">
            The Simplest Way To Deploy Your Apps on AWS and Kubernetes
            <span className="ml-2" role="img" aria-label="rocket">
              🚀
            </span>
          </h2>
          <p className="text-text-500 mb-6 text-sm">Push your code, Qovery handles the rest</p>
          <ul className="list-disc pl-4 text-sm">
            <li className="font-bold text-text-500 mb-2">
              <a href="/" className="link text-brand-500 mr-1">
                Deploy your apps
              </a>
              on AWS in seconds
            </li>
            <li className="font-bold text-text-500 mb-2">
              <a href="/" className="link text-brand-500 mr-1">
                Get instant preview
              </a>
              environments
            </li>
            <li className="font-bold text-text-500 mb-2">
              <a href="/" className="link text-brand-500 mr-1">
                Reduce your Cloud
              </a>
              cost by 60%
            </li>
            <li className="font-bold text-text-500">
              <a href="/" className="link text-brand-500 mr-1">
                Boost your team
              </a>
              experience
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login
