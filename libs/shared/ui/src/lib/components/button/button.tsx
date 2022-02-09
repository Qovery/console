import './button.module.scss'

/* eslint-disable-next-line */
export interface ButtonProps {}

export function Button(props: ButtonProps) {
  return (
    <a
      href="/"
      className="inline-flex items-center justify-center px-5 py-3 font-medium rounded-md text-white bg-brand-500 hover:bg-brand-800"
    >
      Button
    </a>
  )
}

export default Button
