"use client"

import * as React from "react"
import clsx from "clsx"

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (v: string) => void
} | null>(null)

export function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
    const [val, setVal] = React.useState(value || defaultValue)
    const handleChange = (v: string) => {
        setVal(v)
        onValueChange?.(v)
    }

    return (
        <TabsContext.Provider value={{ value: val, onValueChange: handleChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ children, className }: any) {
    return <div className={clsx("flex flex-row", className)}>{children}</div>
}

export function TabsTrigger({ value, children, className }: any) {
    const ctx = React.useContext(TabsContext)
    if (!ctx) return null
    const active = ctx.value === value
    return (
        <button
            onClick={() => ctx.onValueChange(value)}
            className={clsx(className, active && "bg-white shadow-sm")}
            data-state={active ? "active" : "inactive"}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className }: any) {
    const ctx = React.useContext(TabsContext)
    if (!ctx || ctx.value !== value) return null
    return <div className={className}>{children}</div>
}
