import toast from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

// Utility wrappers around react-hot-toast for consistent UI
export const showToast = {
  success: (message) =>
    toast.success(message, {
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    }),

  error: (message) =>
    toast.error(message, {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    }),

  warning: (message) =>
    toast(message, {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    }),

  info: (message) =>
    toast(message, {
      icon: <Info className="w-5 h-5 text-blue-500" />,
    }),

  loading: (message) =>
    toast.loading(message),

  dismiss: (id) =>
    toast.dismiss(id),

  promise: (promise, { loading, success, error }) =>
    toast.promise(promise, { loading, success, error }),
}

export default showToast
