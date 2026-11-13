import type { ComponentProps, ReactNode } from "react"

import { buttonClass, type Variant } from "@/components/button-class"
import { cn } from "@/lib/cn"

export function Button({
  variant,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={buttonClass(variant, className)}
      {...props}
    />
  )
}

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode
  tone?: "default" | "warn" | "green" | "orange"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md px-2 font-mono text-[11px] font-medium",
        tone === "default" && "bg-land text-ink",
        tone === "warn" && "bg-warn-bg text-warn-fg",
        tone === "green" && "bg-green-soft text-green",
        tone === "orange" && "bg-orange text-orange-ink",
        className
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number
  label?: string
  className?: string
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cn("h-2 overflow-hidden rounded-full bg-land", className)}
    >
      <div
        className="h-full rounded-full bg-orange transition-[width] duration-300"
        style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }}
      />
    </div>
  )
}

export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      {eyebrow && <p className="eyebrow text-green">{eyebrow}</p>}
      <h1 className="font-display text-[26px] leading-tight font-bold tracking-tight text-balance">
        {title}
      </h1>
      {children && <div className="text-sm text-muted">{children}</div>}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex max-w-full overflow-x-auto rounded-full border border-line bg-land p-[3px]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className="min-h-9 flex-none rounded-full px-3.5 text-[13px] font-medium text-muted aria-selected:bg-surface aria-selected:text-ink aria-selected:shadow-sm"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line p-3.5 text-sm text-muted">
      {children}
    </p>
  )
}
