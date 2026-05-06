import { useToast } from "@/components/ui/use-toast";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const visible = toasts.filter(t => t.open);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4 sm:top-4 z-[100] w-full max-w-sm px-4 sm:px-0 pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {visible.map(({ id, title, description, variant }) => {
          const isDestructive = variant === "destructive";
          const Icon = isDestructive ? AlertTriangle : title?.toLowerCase().includes('sucesso') || title?.toLowerCase().includes('removid') || title?.toLowerCase().includes('cancelad') ? CheckCircle2 : Info;
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`pointer-events-auto relative flex items-start gap-3 rounded-2xl shadow-lg border p-3 pr-9 backdrop-blur-xl ${
                isDestructive
                  ? "bg-red-50/95 border-red-200 text-red-900"
                  : "bg-white/95 border-gray-200 text-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDestructive ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
              }`}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                {title && <p className="text-sm font-bold leading-snug">{title}</p>}
                {description && <p className="text-xs opacity-80 mt-0.5 leading-snug">{description}</p>}
              </div>
              <button
                onClick={() => dismiss(id)}
                className="absolute right-2 top-2 w-6 h-6 rounded-lg hover:bg-black/5 flex items-center justify-center transition opacity-60 hover:opacity-100"
              >
                <X size={13} />
              </button>
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 2.5, ease: "linear" }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left rounded-b-2xl ${
                  isDestructive ? "bg-red-400" : "bg-blue-400"
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}