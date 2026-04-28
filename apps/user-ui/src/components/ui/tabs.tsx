"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string
  onValueChange?: (value: string) => void
  value?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ children, className, defaultValue = "", onValueChange, value, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value ?? internalValue

    const setValue = React.useCallback(
      (nextValue: string) => {
        if (value === undefined) {
          setInternalValue(nextValue)
        }

        onValueChange?.(nextValue)
      },
      [onValueChange, value]
    )

    return (
      <TabsContext.Provider value={{ value: currentValue, setValue }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-[var(--ac-linen)] p-1 text-[var(--ac-graphite)]",
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, onClick, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)

    if (!context) {
      throw new Error("TabsTrigger must be used within Tabs")
    }

    const isActive = context.value === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--ac-charcoal)] data-[state=active]:text-[var(--ac-ivory)] data-[state=active]:shadow-sm",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) {
            context.setValue(value)
          }
        }}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)

    if (!context) {
      throw new Error("TabsContent must be used within Tabs")
    }

    if (context.value !== value) {
      return null
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state="active"
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
