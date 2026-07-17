import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ===== Public Layout & Pages =====
const PublicLayout = lazy(() => import('../components/common/PublicLayout'))
const LandingPage = lazy(() => import('../pages/public/LandingPage'))
const MarketplacePage = lazy(() => import('../pages/public/MarketplacePage'))
const BusinessDetailPage = lazy(() => import('../pages/public/BusinessDetailPage'))
const ServiceDetailPage = lazy(() => import('../pages/public/ServiceDetailPage'))
const BookingFlow = lazy(() => import('../pages/public/BookingFlow'))

// ===== AI Pages =====
const AIAssistantPage = lazy(() => import('../pages/public/AIAssistantPage'))
const SalonRecommendationsPage = lazy(() => import('../pages/public/SalonRecommendationsPage'))
const ServiceSuggestionsPage = lazy(() => import('../pages/public/ServiceSuggestionsPage'))
const HairAnalysisPage = lazy(() => import('../pages/public/HairAnalysisPage'))
const SkinAnalysisPage = lazy(() => import('../pages/public/SkinAnalysisPage'))
const UnauthorizedAccessPage = lazy(() => import('../pages/public/UnauthorizedAccessPage'))
const NotificationCenterPage = lazy(() => import('../pages/common/NotificationCenterPage'))

// ===== Auth Pages =====
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const OTPVerificationPage = lazy(() => import('../pages/auth/OTPVerificationPage'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))

// ===== Customer Dashboard =====
const CustomerLayout = lazy(() => import('../components/common/CustomerLayout'))
const CustomerDashboard = lazy(() => import('../pages/customer/CustomerDashboard'))
const MyBookings = lazy(() => import('../pages/customer/MyBookings'))
const Favorites = lazy(() => import('../pages/customer/Favorites'))
const Wallet = lazy(() => import('../pages/customer/Wallet'))
const CustomerNotifications = lazy(() => import('../pages/customer/Notifications'))
const ProfileSettings = lazy(() => import('../pages/customer/ProfileSettings'))
const RescheduleAppointmentPage = lazy(() => import('../pages/customer/RescheduleAppointmentPage'))
const PaymentHistoryPage = lazy(() => import('../pages/customer/PaymentHistoryPage'))
const PaymentVerificationPage = lazy(() => import('../pages/customer/PaymentVerificationPage'))
const BookAppointment = lazy(() => import('../pages/customer/BookAppointment'))
const CustomerMemberships = lazy(() => import('../pages/customer/CustomerMemberships'))

// ===== Business Dashboard =====
const BusinessLayout = lazy(() => import('../components/common/BusinessLayout'))
const BusinessDashboard = lazy(() => import('../pages/business/BusinessDashboard'))
const CalendarPage = lazy(() => import('../pages/business/CalendarPage'))
const AppointmentsPage = lazy(() => import('../pages/business/AppointmentsPage'))
const CustomersPage = lazy(() => import('../pages/business/CustomersPage'))
const StaffPage = lazy(() => import('../pages/business/StaffPage'))
const ServicesPage = lazy(() => import('../pages/business/ServicesPage'))
const ProductsPage = lazy(() => import('../pages/business/ProductsPage'))
const MembershipsPage = lazy(() => import('../pages/business/MembershipsPage'))
const GiftCardsPage = lazy(() => import('../pages/business/GiftCardsPage'))
const PaymentsPage = lazy(() => import('../pages/business/PaymentsPage'))
const ReportsPage = lazy(() => import('../pages/business/ReportsPage'))
const MarketingPage = lazy(() => import('../pages/business/MarketingPage'))
const BusinessReviewsPage = lazy(() => import('../pages/business/ReviewsPage'))
const BusinessSettings = lazy(() => import('../pages/business/BusinessSettings'))
const EditSalonProfilePage = lazy(() => import('../pages/business/EditSalonProfilePage'))
const ManageServicesPage = lazy(() => import('../pages/business/ManageServicesPage'))
const SalonPerformanceDashboard = lazy(() => import('../pages/business/SalonPerformanceDashboard'))
const ManageSalonPage = lazy(() => import('../pages/business/ManageSalonPage'))

// ===== Admin Panel =====
const AdminLayout = lazy(() => import('../components/common/AdminLayout'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))
const AdminBusinesses = lazy(() => import('../pages/admin/AdminBusinesses'))
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'))
const AdminSubscriptions = lazy(() => import('../pages/admin/AdminSubscriptions'))
const AdminSupport = lazy(() => import('../pages/admin/AdminSupport'))
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'))
const RoleManagementInterface = lazy(() => import('../pages/admin/RoleManagementInterface'))
const BookingStatisticsDashboard = lazy(() => import('../pages/admin/BookingStatisticsDashboard'))

// ===== Route Guards =====
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  
  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated, role } = useAuthStore()
  
  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'business_owner') return <Navigate to="/business" replace />
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-950">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="explore" element={<MarketplacePage />} />
          <Route path="business/:slug" element={<BusinessDetailPage />} />
          <Route path="business/:slug/service/:serviceId" element={<ServiceDetailPage />} />
          {/* AI Feature Routes */}
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="recommendations/salons" element={<SalonRecommendationsPage />} />
          <Route path="recommendations/services" element={<ServiceSuggestionsPage />} />
          <Route path="analysis/hair" element={<HairAnalysisPage />} />
          <Route path="analysis/skin" element={<SkinAnalysisPage />} />
          <Route path="unauthorized" element={<UnauthorizedAccessPage />} />
          <Route path="notification-center" element={<ProtectedRoute roles={['customer', 'business_owner', 'admin']}><NotificationCenterPage /></ProtectedRoute>} />

          {/* ===== CUSTOMER DASHBOARD ===== */}
          <Route path="dashboard" element={
            <ProtectedRoute roles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CustomerDashboard />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="bookings/:id/reschedule" element={<RescheduleAppointmentPage />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="payment-history" element={<PaymentHistoryPage />} />
            <Route path="payment-verification" element={<PaymentVerificationPage />} />
            <Route path="memberships" element={<CustomerMemberships />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* ===== CUSTOMER BOOK-APPOINTMENT ===== */}
          <Route path="customer" element={
            <ProtectedRoute roles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route path="book-appointment" element={<BookAppointment />} />
          </Route>

          {/* ===== BUSINESS DASHBOARD ===== */}
          <Route path="business" element={
            <ProtectedRoute roles={['business_owner']}>
              <BusinessLayout />
            </ProtectedRoute>
          }>
            <Route index element={<BusinessDashboard />} />
            <Route path="manage-salon" element={<ManageSalonPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="memberships" element={<MembershipsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reviews" element={<BusinessReviewsPage />} />
            <Route path="settings" element={<BusinessSettings />} />
            <Route path="edit-profile" element={<EditSalonProfilePage />} />
            <Route path="manage-services" element={<ManageServicesPage />} />
            <Route path="performance" element={<SalonPerformanceDashboard />} />
          </Route>

          {/* ===== ADMIN PANEL ===== */}
          <Route path="admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="role-management" element={<RoleManagementInterface />} />
            <Route path="booking-statistics" element={<BookingStatisticsDashboard />} />
          </Route>
          
          {/* Booking flow (separate from public layout) */}
          <Route path="book/:businessSlug" element={
            <ProtectedRoute roles={['customer']}>
              <BookingFlow />
            </ProtectedRoute>
          } />

          {/* ===== AUTH ROUTES ===== */}
          <Route path="auth">
            <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="verify-otp" element={<OTPVerificationPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* ===== 404 ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
