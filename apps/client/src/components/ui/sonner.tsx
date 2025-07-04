"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/10 group-[.toaster]:backdrop-blur-sm group-[.toaster]:border group-[.toaster]:border-prop-scholar-electric-blue/20 group-[.toaster]:text-prop-scholar-main-text group-[.toaster]:shadow-[0_0_30px_rgba(36,107,253,0.3)] group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-prop-scholar-secondary-text",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-prop-scholar-royal-blue group-[.toast]:to-prop-scholar-electric-blue group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:px-4 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-prop-scholar-main-text group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:px-4 group-[.toast]:py-2",
          success:
            "group-[.toaster]:bg-green-500/10 group-[.toaster]:border-green-500/30 group-[.toaster]:text-green-400",
          error:
            "group-[.toaster]:bg-red-500/10 group-[.toaster]:border-red-500/30 group-[.toaster]:text-red-400",
          warning:
            "group-[.toaster]:bg-amber-500/10 group-[.toaster]:border-amber-500/30 group-[.toaster]:text-amber-400",
          info:
            "group-[.toaster]:bg-prop-scholar-electric-blue/10 group-[.toaster]:border-prop-scholar-electric-blue/30 group-[.toaster]:text-prop-scholar-electric-blue",
        },
        style: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(36, 107, 253, 0.2)',
          borderRadius: '12px',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
