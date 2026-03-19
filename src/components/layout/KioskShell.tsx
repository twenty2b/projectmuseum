import type { ReactNode } from 'react'

interface KioskShellProps {
  children: ReactNode
}

export function KioskShell({ children }: KioskShellProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      {children}
    </div>
  )
}
