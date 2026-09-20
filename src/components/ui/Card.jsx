import { forwardRef } from 'react'

export const Card = forwardRef(function Card({ children, className = '', as: Comp = 'div', ...rest }, ref) {
  return (
    <Comp
      ref={ref}
      className={`rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-md transition dark:border-white/10 dark:bg-[#1a4731]/35 ${className}`}
      {...rest}
    >
      {children}
    </Comp>
  )
})
