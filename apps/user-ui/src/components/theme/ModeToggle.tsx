"use client"

import * as React from "react"
import { useRef, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { gsap } from "gsap"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2

    gsap.to(buttonRef.current, {
      x,
      y,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current) return

    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    })
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          ref={buttonRef}
          className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 hover:bg-[var(--ac-gold)]/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ac-gold)]/50"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90 absolute" />
          <Moon className="h-5 w-5 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0 absolute" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
          <Sun className="w-4 h-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
          <Moon className="w-4 h-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
          <span className="w-4 h-4 mr-2 flex items-center justify-center text-xs">💻</span>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
