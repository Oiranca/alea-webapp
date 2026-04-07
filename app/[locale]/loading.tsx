import { DiceLoader } from '@/components/ui/dice-loader'

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DiceLoader size="lg" />
    </div>
  )
}
