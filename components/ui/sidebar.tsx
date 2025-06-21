"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    href?: string
    onClick?: () => void
    active?: boolean
  }[]
}

export function Sidebar({ className, items, ...props }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {items.map((item, index) => (
              <Button
                key={index}
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.active && "bg-muted font-medium"
                )}
                onClick={item.onClick}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar({ items }: { items: SidebarProps["items"] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="px-3 py-6">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            {items.map((item, index) => (
              <Button
                key={index}
                variant={item.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}