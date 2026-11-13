import { cn } from "@/lib/cn"

export type Variant = "primary" | "ghost" | "orange" | "outline"

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper",
  ghost: "bg-land text-ink",
  orange: "bg-orange text-orange-ink",
  outline: "border border-line bg-surface text-ink",
}

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform active:scale-[0.97] disabled:opacity-50",
    variants[variant],
    className
  )
