import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Home, ArrowLeft, LogOut } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

export default function UnauthorizedAccessPage() {
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-surface-900 rounded-3xl p-8 shadow-card text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">
          Access Denied
        </h1>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          You don't have the necessary permissions to view this page. Please contact an administrator if you believe this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={18} />}
          >
            Go Back
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
            leftIcon={<Home size={18} />}
          >
            Back to Home
          </Button>
        </div>
        
        {isAuthenticated && (
          <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-800">
            <p className="text-sm text-surface-500 mb-4">Want to access this page with a different account?</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
              leftIcon={<LogOut size={18} />}
            >
              Sign out and Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
