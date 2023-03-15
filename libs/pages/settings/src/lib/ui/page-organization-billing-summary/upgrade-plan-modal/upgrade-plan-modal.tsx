import { PlanEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum, InputRadioBox, Link } from '@qovery/shared/ui'

export interface UpgradePlanModalProps {
  currentPlan?: PlanEnum
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  openCheckout: (plan: PlanEnum) => void
}

export function UpgradePlanModal(props: UpgradePlanModalProps) {
  const { control, watch } = useFormContext<{ plan: PlanEnum }>()
  const watchPlan = watch('plan')

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 mb-2 max-w-sm">Change plan</h2>
      <p className="text-text-500 text-sm mb-1">
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim
        velit mollit.
      </p>
      <Link
        link="https://qovery.com/pricing"
        className="text-text-500 text-sm"
        external
        iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
        linkLabel="See details plan"
      ></Link>
      <div className="my-8">
        <Controller
          name={'plan'}
          control={control}
          render={({ field }) => (
            <>
              <InputRadioBox
                name={field.name}
                onChange={field.onChange}
                fieldValue={field.value}
                label="Free plan"
                value={PlanEnum.FREE}
                description="Adapted for small company"
                rightElement={
                  <div className="flex flex-col align-bottom text-right">
                    <strong className="text-text-500 text-xl font-bold">$0</strong>
                    {props.currentPlan === PlanEnum.FREE && (
                      <span className="text-brand-500 text-xs font-medium">Current plan</span>
                    )}
                  </div>
                }
              />
              <InputRadioBox
                name={field.name}
                onChange={field.onChange}
                fieldValue={field.value}
                label="Team plan"
                value={PlanEnum.BUSINESS}
                description="For medium company"
                rightElement={
                  <div className="flex flex-col text-right text-text-500 text-sm">
                    <span>
                      <strong className="text-text-700 text-xl font-bold">$49</strong> / user
                    </span>
                    {props.currentPlan === PlanEnum.BUSINESS && (
                      <span className="text-brand-500 text-xs font-medium mt-0.5">Current plan</span>
                    )}
                  </div>
                }
              />
              <InputRadioBox
                name={field.name}
                onChange={field.onChange}
                fieldValue={field.value}
                label="Enterprise plan"
                description="For large company"
                value={PlanEnum.ENTERPRISE}
                rightElement={
                  <div className="flex flex-col align-bottom  text-right text-text-500 text-sm flex flex-col ">
                    <span>Contact us</span>
                    {props.currentPlan === PlanEnum.ENTERPRISE && (
                      <span className="text-brand-500 text-xs font-medium">Current plan</span>
                    )}
                  </div>
                }
              />
            </>
          )}
        />
      </div>
      {watchPlan === PlanEnum.FREE &&
        (props.currentPlan === PlanEnum.TEAM ||
          props.currentPlan === PlanEnum.BUSINESS ||
          props.currentPlan === PlanEnum.ENTERPRISE) && (
          <div className="bg-brand-50 rounded-lg p-6">
            <div className="text-text-500 font-medium mb-3">You will also no longer receive the following benefits</div>

            <ul className="flex flex-col gap-2 text-sm text-text-500 mb-3">
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CROSS} className="text-error-500 relative top-[1px]" />
                Deploy on your cloud
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CROSS} className="text-error-500 relative top-[1px]" />
                Deployments unlimited
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CROSS} className="text-error-500 relative top-[1px]" />
                API included
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CROSS} className="text-error-500 relative top-[1px]" />
                Preview environments
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CROSS} className="text-error-500 relative top-[1px]" />
                Containers
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CROSS} className="text-error-500 relative top-[1px]" />3 clusters
              </li>
            </ul>

            <p className="text-text-500 text-sm mb-5">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis
              enim velit mollit.
            </p>

            <div className="text-text-500 font-medium mb-2">Make the following changes before proceeding</div>
            <div className="rounded border border-brand-500 bg-white p-4 flex gap-2 mb-5">
              <Icon name={IconAwesomeEnum.CROSS} className="text-error-500 top-[-1px] relative" />
              <div className="flex flex-col gap-1">
                <span className="text-text-600 font-bold text-sm">Reduce clusters</span>
                <p className="text-sm text-text-400">The selected package is available for 1 cluster only</p>
              </div>
            </div>

            <Button className="w-full" style={ButtonStyle.BASIC} disabled size={ButtonSize.XLARGE}>
              Downgrade plan
            </Button>
          </div>
        )}
      {props.currentPlan === PlanEnum.FREE &&
        (watchPlan === PlanEnum.TEAM || watchPlan === PlanEnum.BUSINESS || watchPlan === PlanEnum.ENTERPRISE) && (
          <div className="bg-brand-50 rounded-lg p-6">
            <div className="text-text-500 font-medium mb-3">You will also benefit from the following services</div>

            <ul className="flex flex-col gap-2 text-sm text-text-500 mb-3">
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CHECK} className="text-success-500 relative top-[1px]" />
                Deploy on your cloud
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.FIRE} className="text-error-500 relative top-[1px]" />
                Deployments unlimited
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CHECK} className="text-success-500 relative top-[1px]" />
                API included
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CHECK} className="text-success-500 relative top-[1px]" />
                Preview environments
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CHECK} className="text-success-500 relative top-[1px]" />
                Containers
              </li>
              <li className="flex items-center gap-2">
                <Icon name={IconAwesomeEnum.CHECK} className="text-success-500 relative top-[1px]" />3 clusters
              </li>
            </ul>

            <p className="text-text-500 text-sm mb-5">You will be charged $49 per user.</p>

            <Button
              className="w-full"
              style={ButtonStyle.BASIC}
              size={ButtonSize.XLARGE}
              onClick={() => {
                props.openCheckout(watchPlan)
              }}
            >
              Upgrade plan
            </Button>
          </div>
        )}
    </div>
  )
}

export default UpgradePlanModal
