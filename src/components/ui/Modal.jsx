import { AnimatePresence, motion } from 'framer-motion'

export function Modal({ open, onClose, title, labelledBy, describedBy, children }) {
  const titleId = labelledBy || 'modal-title'
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Close dialog backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            className="relative z-[81] w-full max-w-lg rounded-2xl border border-black/10 bg-[#fafaf7] p-6 shadow-2xl dark:border-white/10 dark:bg-[#122b1f]"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {title ? (
              <h2 id={titleId} className="text-lg font-bold text-[#1a4731] dark:text-[#fafaf7]">
                {title}
              </h2>
            ) : null}
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
