import { type PropsWithChildren } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import { type Subnets } from '@qovery/shared/interfaces'
import { Callout, ExternalLink, Icon, InputText, Tooltip } from '@qovery/shared/ui'
import { removeEmptySubnet } from '../../../../feature/page-clusters-create-feature/step-features-feature/step-features-feature'
import ButtonPopoverSubnets from '../button-popover-subnets/button-popover-subnets'

export function areSubnetsEmpty(subnets?: Subnets[]): boolean {
  if (!subnets) return true
  return removeEmptySubnet(subnets)?.length === 0
}

function TooltipContentSubnets({ children, subnets }: PropsWithChildren & { subnets?: Subnets[] }) {
  if (!subnets || subnets.length === 0 || areSubnetsEmpty(subnets)) return null

  return (
    <div className="flex items-start">
      <div className="flex flex-col">{children}</div>
      <div>
        {subnets.map((item, index) => (
          <p key={index}>
            {item.A !== '' && <span className="inline-block w-[165px]">A: {item.A}</span>}
            {item.B !== '' && <span className="inline-block w-[165px]">B: {item.B}</span>}
            {item.C !== '' && <span className="inline-block w-[165px]">C: {item.C}</span>}
          </p>
        ))}
      </div>
    </div>
  )
}

function TooltipContent({
  values,
}: {
  values: {
    aws_vpc_eks_id: string
    eks_subnets?: Subnets[]
    mongodb_subnets?: Subnets[]
    rds_subnets?: Subnets[]
    redis_subnets?: Subnets[]
  }
}) {
  const { eks_subnets, mongodb_subnets, rds_subnets, redis_subnets } = values

  return (
    <div className="grid gap-2 p-2">
      <TooltipContentSubnets subnets={eks_subnets}>
        <Icon name={IconEnum.EKS} width="16" className="mr-2" />
      </TooltipContentSubnets>
      <TooltipContentSubnets subnets={mongodb_subnets}>
        <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
      </TooltipContentSubnets>
      <TooltipContentSubnets subnets={redis_subnets}>
        <Icon name={IconEnum.REDIS} width="16" className="mr-2" />
      </TooltipContentSubnets>
      <TooltipContentSubnets subnets={rds_subnets}>
        <Icon name={IconEnum.MYSQL} width="16" className="mr-2" />
        <Icon name={IconEnum.POSTGRESQL} width="16" className="mr-2" />
      </TooltipContentSubnets>
    </div>
  )
}

export function AWSVpcFeature() {
  const { control, getValues } = useFormContext()

  const isTooltipAvailable = () => {
    const vpcValues = getValues('aws_existing_vpc')
    if (!vpcValues) return false
    const { eks_subnets, mongodb_subnets, rds_subnets, redis_subnets } = vpcValues

    return [eks_subnets, mongodb_subnets, rds_subnets, redis_subnets]
      .map(removeEmptySubnet)
      .some((subnets) => subnets && subnets.length > 0)
  }

  return (
    <div className="flex flex-col justify-between rounded border border-neutral-250 bg-neutral-100 p-4">
      <div className="flex justify-between">
        <div>
          <h4 className="mb-1 text-sm font-medium text-neutral-400">Deploy on an existing VPC</h4>
          <p className="mb-4 text-sm text-neutral-350">In your VPC settings, you must enable the DNS hostnames.</p>
        </div>
        {isTooltipAvailable() && (
          <Tooltip content={<TooltipContent values={getValues('aws_existing_vpc')} />}>
            <span className="text-sm font-medium text-brand-500">
              My VPC subnets summary <Icon iconName="eye" className="ml-1" />
            </span>
          </Tooltip>
        )}
      </div>
      <Controller
        name="aws_existing_vpc.aws_vpc_eks_id"
        rules={{ required: true, shouldUnregister: true }}
        control={control}
        render={({ field }) => (
          <>
            <InputText label="VPC ID" name={field.name} value={field.value} onChange={field.onChange} />
            <ExternalLink
              size="xs"
              href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#use-existing-vpc"
              className="mb-4 ml-4 mt-1"
            >
              How to configure your VPC
            </ExternalLink>
          </>
        )}
      />
      <h4 className="mb-3 text-sm font-medium text-neutral-400">EKS subnet IDs</h4>
      <ButtonPopoverSubnets
        title="EKS subnets IDs"
        name="aws_existing_vpc.eks_subnets"
        required
        callout={
          <Callout.Root className="mb-4" color="sky">
            <Callout.Icon>
              <Icon className="text-xs" iconName="triangle-exclamation" />
            </Callout.Icon>
            <Callout.Text className="text-xs">
              <Callout.TextHeading>
                You must enable auto-assign public IPv4 address in the subnets settings for EKS
              </Callout.TextHeading>
            </Callout.Text>
          </Callout.Root>
        }
      >
        <Icon name={IconEnum.EKS} width="16" className="mr-2" />
        EKS
      </ButtonPopoverSubnets>
      <hr className="my-3" />
      <h4 className="mb-3 text-sm font-medium text-neutral-400">Subnets IDs for managed databases (optional)</h4>
      <div className="flex gap-3">
        <ButtonPopoverSubnets title="MongoDB subnets IDs" name="aws_existing_vpc.mongodb_subnets">
          <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
          MongoDB
        </ButtonPopoverSubnets>
        <ButtonPopoverSubnets title="MySQL/PostreSQL subnets IDs" name="aws_existing_vpc.rds_subnets">
          <Icon name={IconEnum.MYSQL} width="16" className="mr-2" />
          MySQL
          <span className="px-2">|</span>
          <Icon name={IconEnum.POSTGRESQL} width="16" className="mr-2" />
          PostgreSQL
        </ButtonPopoverSubnets>
        <ButtonPopoverSubnets title="Redis subnets IDs" name="aws_existing_vpc.redis_subnets">
          <Icon name={IconEnum.REDIS} width="16" className="mr-2" />
          Redis
        </ButtonPopoverSubnets>
      </div>
    </div>
  )
}

export default AWSVpcFeature
