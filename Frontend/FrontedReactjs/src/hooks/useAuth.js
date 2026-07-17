import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, role, login, logout, updateUser } = useAuthStore()

  const handleLogin = (userData, token) => {
    login(userData, token)
    toast.success(`Welcome back, ${userData.name || 'User'}!`)
    
    // Redirect based on role
    if (userData.role === 'admin') {
      navigate('/admin')
    } else if (userData.role === 'business_owner') {
      navigate('/business')
    } else {
      navigate('/dashboard')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleRegister = (userData, token) => {
    login(userData, token)
    toast.success('Account created successfully! Welcome!')
    navigate('/dashboard')
  }

  return {
    user,
    isAuthenticated,
    role,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateUser,
    isCustomer: role === 'customer',
    isBusinessOwner: role === 'business_owner',
    isAdmin: role === 'admin',
  }
}
