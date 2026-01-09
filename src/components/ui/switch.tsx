import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex items-center cursor-pointer", disabled && "cursor-not-allowed opacity-50")}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            if (!disabled && onCheckedChange) {
              onCheckedChange(e.target.checked)
            }
          }}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out",
          "bg-slate-200 dark:bg-slate-700",
          "peer-checked:bg-primary",
          "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 dark:peer-focus:ring-offset-slate-800",
          className
        )}>
          <span className={cn(
            "absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full border border-slate-300 dark:border-slate-600",
            "transition-transform duration-200 ease-in-out",
            "peer-checked:translate-x-5"
          )} />
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
