import * as React from "react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string
    alt?: string
    fallback?: string | React.ReactNode
  }
>(({ className, src, alt = "", fallback, ...props }, ref) => {
  const [error, setError] = React.useState(false)

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
          {typeof fallback === 'string' ? (
            <span className="text-sm font-medium text-gray-600">
              {fallback}
            </span>
          ) : (
            fallback
          )}
        </div>
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"

export { Avatar }
