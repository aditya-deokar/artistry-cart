// src/components/products/ProductDialog.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ProductDialog({ trigger, children }: { 
  trigger: React.ReactNode; 
  children: React.ReactNode; 
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger element */}
      <div onClick={() => setOpen(true)}>
        {trigger}
      </div>

      {/* Full-screen dialog */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex justify-center items-start overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-background w-full min-h-screen p-4 md:p-8 relative"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
