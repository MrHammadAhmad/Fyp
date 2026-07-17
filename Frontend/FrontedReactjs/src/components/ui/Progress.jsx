import React from 'react'
import { cn } from '../../utils/helpers'

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-brand-500 transition-all duration-500 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
