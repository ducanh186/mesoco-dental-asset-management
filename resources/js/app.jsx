import './bootstrap';
import '../css/app.css';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Layout Components
import AdminLayout from './layouts/AdminLayout';

// Page Components
import Dashboard from './pages/Dashboard';
import UIKit from './pages/UIKit';
import ProfilePage from './pages/ProfilePage';
import MyEquipmentPage from './pages/MyEquipmentPage';
import AssetsPage from './pages/AssetsPage';
import MyAssetsPage from './pages/MyAssetsPage';
import RequestsPage from './pages/RequestsPage';
import ReviewRequestsPage from './pages/ReviewRequestsPage';
import MaintenancePage from './pages/MaintenancePage';
import InventoryPage from './pages/InventoryPage';
import LocationsPage from './pages/LocationsPage';
import AdminPage from './pages/AdminPage';
import MyAssetHistoryPage from './pages/MyAssetHistoryPage';

// UI Components
import { ToastProvider } from './components/ui';

// i18n - Internationalization
import { I18nProvider, useI18n } from './i18n';

// ============================================================================
// Axios Configuration
// ============================================================================
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ============================================================================
// Auth Context
// ============================================================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);

     const fetchUser = async () => {
          try {
               const response = await axios.get('/api/me');
               setUser(response.data.user);
          } catch (error) {
               setUser(null);
          } finally {
               setLoading(false);
          }
     };

     const login = async (employee_code, password) => {
          await axios.get('/sanctum/csrf-cookie');
          await axios.post('/login', { employee_code, password });
          await fetchUser();
     };

     const logout = async () => {
          await axios.post('/logout');
          setUser(null);
     };

     useEffect(() => {
          fetchUser();
     }, []);

     return (
          <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
               {children}
          </AuthContext.Provider>
     );
};

const useAuth = () => useContext(AuthContext);

// ============================================================================
// Auth Guard Components
// ============================================================================
const ProtectedRoute = ({ children }) => {
     const { user, loading } = useAuth();
     const location = useLocation();

     if (loading) {
          return <LoadingScreen />;
     }

     if (!user) {
          return <Navigate to="/login" state={{ from: location }} replace />;
     }

     return children;
};

const GuestRoute = ({ children }) => {
     const { user, loading } = useAuth();

     if (loading) {
          return <LoadingScreen />;
     }

     if (user) {
          return <Navigate to="/dashboard" replace />;
     }

     return children;
};

const AdminOnlyRoute = ({ children }) => {
     const { user, loading } = useAuth();
     const location = useLocation();

     if (loading) {
          return <LoadingScreen />;
     }

     if (!user) {
          return <Navigate to="/login" state={{ from: location }} replace />;
     }

     if (user.role !== 'admin') {
          return <Navigate to="/dashboard" replace />;
     }

     return children;
};

// ============================================================================
// Loading Screen
// ============================================================================
const LoadingScreen = () => (
     <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
     </div>
);

// ============================================================================
// Admin Layout Wrapper - Connects Auth Context with AdminLayout
// ============================================================================
const AdminLayoutWrapper = ({ children, title, breadcrumbs }) => {
     const { user, logout } = useAuth();
     const navigate = useNavigate();

     const handleLogout = async () => {
          try {
               await logout();
               navigate('/login');
          } catch (error) {
               console.error('Logout failed', error);
          }
     };

     return (
          <AdminLayout 
               title={title} 
               breadcrumbs={breadcrumbs}
               user={user}
               onLogout={handleLogout}
          >
               {children}
          </AdminLayout>
     );
};

// ============================================================================
// Auth Pages
// ============================================================================
const ForgotPasswordPage = () => {
     const [step, setStep] = useState(1); // 1 = request code, 2 = verify & reset
     const [email, setEmail] = useState('');
     const [verificationCode, setVerificationCode] = useState('');
     const [password, setPassword] = useState('');
     const [passwordConfirmation, setPasswordConfirmation] = useState('');
     const [error, setError] = useState(null);
     const [isLoading, setIsLoading] = useState(false);
     const [successMessage, setSuccessMessage] = useState(null);
     const [countdown, setCountdown] = useState(0);
     const { t } = useI18n();
     const navigate = useNavigate();

     useEffect(() => {
          if (countdown > 0) {
               const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
               return () => clearTimeout(timer);
          }
     }, [countdown]);

     const handleRequestCode = async (e) => {
          e.preventDefault();
          setError(null);
          setSuccessMessage(null);
          setIsLoading(true);

          try {
               const response = await axios.post('/forgot-password/request', { email });
               setSuccessMessage(response.data.message);
               setStep(2);
               setCountdown(60); // 60 second cooldown for resend
          } catch (err) {
               const message = err.response?.data?.message ||
                    err.response?.data?.errors?.email?.[0] ||
                    t('auth.failedToSendCode');
               setError(message);
          } finally {
               setIsLoading(false);
          }
     };

     const handleResetPassword = async (e) => {
          e.preventDefault();
          setError(null);
          setSuccessMessage(null);
          setIsLoading(true);

          try {
               const response = await axios.post('/forgot-password/reset', {
                    email,
                    verification_code: verificationCode,
                    password,
                    password_confirmation: passwordConfirmation,
               });
               setSuccessMessage(response.data.message);
               setTimeout(() => {
                    navigate('/login');
               }, 2000);
          } catch (err) {
               const errors = err.response?.data?.errors;
               const message = err.response?.data?.message ||
                    errors?.verification_code?.[0] ||
                    errors?.password?.[0] ||
                    errors?.email?.[0] ||
                    t('auth.failedToResetPassword');
               setError(message);
          } finally {
               setIsLoading(false);
          }
     };

     const handleResendCode = async () => {
          if (countdown > 0) return;
          
          setError(null);
          setSuccessMessage(null);
          setIsLoading(true);

          try {
               const response = await axios.post('/forgot-password/request', { email });
               setSuccessMessage(t('auth.verificationCodeResent'));
               setCountdown(60);
          } catch (err) {
               setError(t('auth.failedToResendCode'));
          } finally {
               setIsLoading(false);
          }
     };

     return (
          <div className="auth-layout">
               <div className="auth-card">
                    <div className="auth-header">
                         <h1 className="auth-logo">BlueOC</h1>
                         <p className="auth-subtitle">Asset Management</p>
                    </div>

                    {step === 1 ? (
                         <form onSubmit={handleRequestCode} className="auth-form">
                              <h2 className="auth-title">{t('auth.forgotPassword')}</h2>
                              <p className="auth-description text-center mb-6 text-sm text-gray-500">
                                   {t('auth.forgotPasswordDesc')}
                              </p>

                              {error && (
                                   <div className="alert alert-error">{error}</div>
                              )}
                              {successMessage && (
                                   <div className="alert alert-success">{successMessage}</div>
                              )}

                              <div className="form-group">
                                   <label htmlFor="email">{t('auth.emailAddress')}</label>
                                   <input
                                        id="email"
                                        type="email"
                                        className="form-input"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder={t('auth.enterEmail')}
                                        required
                                        autoFocus
                                   />
                              </div>

                              <button
                                   type="submit"
                                   className="btn btn-primary btn-block mb-4"
                                   disabled={isLoading}
                              >
                                   {isLoading ? t('auth.sending') : t('auth.sendVerificationCode')}
                              </button>

                              <div className="text-center">
                                   <Link to="/login" className="text-sm text-primary hover:text-primary-hover hover:underline">
                                        {t('auth.backToLogin')}
                                   </Link>
                              </div>
                         </form>
                    ) : (
                         <form onSubmit={handleResetPassword} className="auth-form">
                              <h2 className="auth-title">{t('auth.resetPassword')}</h2>
                              <p className="auth-description text-center mb-6 text-sm text-gray-500">
                                   {t('auth.resetPasswordDesc')}
                              </p>

                              {error && (
                                   <div className="alert alert-error">{error}</div>
                              )}
                              {successMessage && (
                                   <div className="alert alert-success">{successMessage}</div>
                              )}

                              <div className="form-group">
                                   <label htmlFor="verification_code">{t('auth.verificationCode')}</label>
                                   <input
                                        id="verification_code"
                                        type="text"
                                        className="form-input text-center text-2xl tracking-widest"
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength="6"
                                        pattern="\d{6}"
                                        required
                                        autoFocus
                                   />
                                   <div className="text-center mt-2">
                                        {countdown > 0 ? (
                                             <span className="text-xs text-gray-500">
                                                  {t('auth.resendCodeIn', { seconds: countdown })}
                                             </span>
                                        ) : (
                                             <button
                                                  type="button"
                                                  onClick={handleResendCode}
                                                  className="text-xs text-primary hover:text-primary-hover hover:underline"
                                                  disabled={isLoading}
                                             >
                                                  {t('auth.resendVerificationCode')}
                                             </button>
                                        )}
                                   </div>
                              </div>

                              <div className="form-group">
                                   <label htmlFor="password">{t('auth.newPassword')}</label>
                                   <input
                                        id="password"
                                        type="password"
                                        className="form-input"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder={t('auth.enterNewPassword')}
                                        required
                                   />
                                   <p className="text-xs text-gray-500 mt-1">
                                        {t('auth.passwordRequirements')}
                                   </p>
                              </div>

                              <div className="form-group">
                                   <label htmlFor="password_confirmation">{t('auth.confirmPassword')}</label>
                                   <input
                                        id="password_confirmation"
                                        type="password"
                                        className="form-input"
                                        value={passwordConfirmation}
                                        onChange={e => setPasswordConfirmation(e.target.value)}
                                        placeholder={t('auth.confirmNewPassword')}
                                        required
                                   />
                              </div>

                              <button
                                   type="submit"
                                   className="btn btn-primary btn-block mb-4"
                                   disabled={isLoading}
                              >
                                   {isLoading ? t('auth.resetting') : t('auth.resetPasswordBtn')}
                              </button>

                              <div className="text-center">
                                   <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm text-primary hover:text-primary-hover hover:underline"
                                   >
                                        {t('auth.backToEmail')}
                                   </button>
                              </div>
                         </form>
                    )}
               </div>
          </div>
     );
};

const LoginPage = () => {
     const [employeeCode, setEmployeeCode] = useState('');
     const [password, setPassword] = useState('');
     const [remember, setRemember] = useState(false);
     const [error, setError] = useState(null);
     const [isLoading, setIsLoading] = useState(false);
     const { login } = useAuth();
     const { t } = useI18n();
     const navigate = useNavigate();
     const location = useLocation();

     const from = location.state?.from?.pathname || '/dashboard';

     const handleSubmit = async (e) => {
          e.preventDefault();
          setError(null);
          setIsLoading(true);

          try {
               await login(employeeCode, password, remember);
               navigate(from, { replace: true });
          } catch (err) {
               const message = err.response?.data?.message ||
                    err.response?.data?.errors?.employee_code?.[0] ||
                    t('auth.loginFailed');
               setError(message);
          } finally {
               setIsLoading(false);
          }
     };

     return (
          <div className="auth-layout">
               <div className="auth-card">
                    <div className="auth-header">
                         <h1 className="auth-logo">BlueOC</h1>
                         <p className="auth-subtitle">Asset Management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                         <h2 className="auth-title">{t('auth.welcomeBack')}</h2>
                         <p className="auth-description text-center mb-6 text-sm text-gray-500">{t('auth.signInToContinue')}</p>

                         {error && (
                              <div className="alert alert-error">{error}</div>
                         )}

                         <div className="form-group">
                              <label htmlFor="employee_code">{t('auth.employeeId')}</label>
                              <input
                                   id="employee_code"
                                   type="text"
                                   className="form-input"
                                   value={employeeCode}
                                   onChange={e => setEmployeeCode(e.target.value)}
                                   placeholder={t('auth.enterEmployeeId')}
                                   required
                                   autoFocus
                              />
                         </div>

                         <div className="form-group">
                              <label htmlFor="password">{t('auth.password')}</label>
                              <input
                                   id="password"
                                   type="password"
                                   className="form-input"
                                   value={password}
                                   onChange={e => setPassword(e.target.value)}
                                   placeholder={t('auth.enterPassword')}
                                   required
                              />
                         </div>

                         <div className="form-group flex items-center justify-between mb-6">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                   <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                        checked={remember}
                                        onChange={e => setRemember(e.target.checked)}
                                   />
                                   <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
                              </label>
                         </div>

                         <button
                              type="submit"
                              className="btn btn-primary btn-block mb-4"
                              disabled={isLoading}
                         >
                              {isLoading ? t('auth.signingIn') : t('auth.continue')}
                         </button>

                         <div className="text-center">
                              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover hover:underline">
                                   {t('auth.forgotPassword')}?
                              </Link>
                         </div>
                    </form>
               </div>
          </div>
     );
};

// ============================================================================
// Dashboard Page Wrapper
// ============================================================================
const DashboardPage = () => {
     const { user } = useAuth();

     return (
          <AdminLayoutWrapper 
               title="Dashboard" 
               breadcrumbs={[{ label: 'Dashboard' }]}
          >
               <Dashboard user={user} />
          </AdminLayoutWrapper>
     );
};

// ============================================================================
// Other Pages (Placeholders using AdminLayoutWrapper)
// ============================================================================
const ProfilePageWrapper = () => {
     const { user } = useAuth();
     return (
          <AdminLayoutWrapper 
               title="My Profile" 
               breadcrumbs={[{ label: 'Profile' }]}
          >
               <ProfilePage user={user} />
          </AdminLayoutWrapper>
     );
};

const AssetsPageWrapper = () => {
     const { user } = useAuth();
     const navigate = useNavigate();
     
     // RBAC check - only admin and hr can access
     useEffect(() => {
          if (user && user.role !== 'admin' && user.role !== 'hr') {
               navigate('/dashboard', { replace: true });
          }
     }, [user, navigate]);
     
     if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
          return null;
     }
     
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('assets.title')} 
               breadcrumbs={[{ label: t('nav.assets') }]}
          >
               <AssetsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const MyAssetsPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('assets.myAssets')} 
               breadcrumbs={[{ label: t('nav.myAssets') }]}
          >
               <MyAssetsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const EquipmentPage = () => (
     <AdminLayoutWrapper 
          title="Equipment" 
          breadcrumbs={[{ label: 'Equipment' }]}
     >
          <div className="placeholder-state">
               <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
               </svg>
               <h3>Equipment Management</h3>
               <p>Manage all dental equipment and devices.</p>
               <span className="coming-soon">Coming in Phase 1</span>
          </div>
     </AdminLayoutWrapper>
);

const QRScanPage = () => (
     <AdminLayoutWrapper 
          title="QR Scanner" 
          breadcrumbs={[{ label: 'QR Scanner' }]}
     >
          <div className="placeholder-state">
               <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
               </svg>
               <h3>Scan Equipment QR Code</h3>
               <p>Use your camera to scan equipment QR codes.</p>
               <span className="coming-soon">Coming in Phase 1</span>
          </div>
     </AdminLayoutWrapper>
);

const RequestsPageWrapper = () => {
     const { user } = useAuth();
     return (
          <AdminLayoutWrapper 
               title="Requests" 
               breadcrumbs={[{ label: 'Requests' }]}
          >
               <RequestsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const ReviewRequestsPageWrapper = () => {
     const { user } = useAuth();
     return (
          <AdminLayoutWrapper 
               title="Review Requests" 
               breadcrumbs={[{ label: 'Review Requests' }]}
          >
               <ReviewRequestsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const MaintenancePageWrapper = () => {
     const { user } = useAuth();
     return (
          <AdminLayoutWrapper 
               title="Maintenance" 
               breadcrumbs={[{ label: 'Maintenance' }]}
          >
               <MaintenancePage user={user} />
          </AdminLayoutWrapper>
     );
};

const InventoryPageWrapper = () => {
     const { user } = useAuth();
     return (
          <AdminLayoutWrapper 
               title="Inventory" 
               breadcrumbs={[{ label: 'Inventory' }]}
          >
               <InventoryPage user={user} />
          </AdminLayoutWrapper>
     );
};

const LocationsPageWrapper = () => {
     const { user } = useAuth();
     return (
          <AdminLayoutWrapper 
               title="Locations" 
               breadcrumbs={[{ label: 'Locations' }]}
          >
               <LocationsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const MyAssetHistoryPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.myAssetHistory')} 
               breadcrumbs={[{ label: t('nav.myAssetHistory') }]}
          >
               <MyAssetHistoryPage user={user} />
          </AdminLayoutWrapper>
     );
};

const ReportsPage = () => (
     <AdminLayoutWrapper 
          title="Reports" 
          breadcrumbs={[{ label: 'Reports' }]}
     >
          <div className="placeholder-state">
               <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
               </svg>
               <h3>Analytics & Reports</h3>
               <p>View equipment usage statistics and reports.</p>
               <span className="coming-soon">Coming in Phase 1</span>
          </div>
     </AdminLayoutWrapper>
);

const UsersPage = () => (
     <AdminLayoutWrapper 
          title="Users" 
          breadcrumbs={[{ label: 'Users' }]}
     >
          <div className="placeholder-state">
               <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
               </svg>
               <h3>User Management</h3>
               <p>Manage users and access permissions.</p>
               <span className="coming-soon">Coming in Phase 1</span>
          </div>
     </AdminLayoutWrapper>
);

const AdminPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('admin.title')} 
               breadcrumbs={[{ label: t('nav.admin') }]}
          >
               <AdminPage user={user} />
          </AdminLayoutWrapper>
     );
};

const SettingsPage = () => (
     <AdminLayoutWrapper 
          title="Settings" 
          breadcrumbs={[{ label: 'Settings' }]}
     >
          <div className="placeholder-state">
               <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4" />
               </svg>
               <h3>System Settings</h3>
               <p>Configure application preferences.</p>
               <span className="coming-soon">Coming in Phase 1</span>
          </div>
     </AdminLayoutWrapper>
);

const NotFoundPage = () => (
     <div className="error-page">
          <div className="error-content">
               <h1 className="error-code">404</h1>
               <h2 className="error-title">Page Not Found</h2>
               <p className="error-message">The page you're looking for doesn't exist or has been moved.</p>
               <Link to="/dashboard" className="btn btn-primary">
                    Back to Dashboard
               </Link>
          </div>
     </div>
);

// ============================================================================
// App Router
// ============================================================================
const App = () => {
     return (
          <BrowserRouter>
               <I18nProvider>
                    <ToastProvider position="top-right">
                         <AuthProvider>
                              <Routes>
                                   {/* Guest Routes */}
                                   <Route path="/login" element={
                                        <GuestRoute>
                                             <LoginPage />
                                        </GuestRoute>
                                   } />
                                   <Route path="/forgot-password" element={
                                        <GuestRoute>
                                             <ForgotPasswordPage />
                                   </GuestRoute>
                              } />

                              {/* UI Kit - Public showcase page */}
                              <Route path="/ui-kit" element={<UIKit />} />

                              {/* Redirect root to dashboard */}
                              <Route path="/" element={<Navigate to="/dashboard" replace />} />

                              {/* Protected Routes */}
                              <Route path="/dashboard" element={
                                   <ProtectedRoute>
                                        <DashboardPage />
                                   </ProtectedRoute>
                              } />
                              <Route path="/profile" element={
                                   <ProtectedRoute>
                                        <ProfilePageWrapper />
                                   </ProtectedRoute>
                              } />

                         <Route path="/assets" element={
                              <ProtectedRoute>
                                   <AssetsPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/my-assets" element={
                              <ProtectedRoute>
                                   <MyAssetsPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/equipment" element={
                              <ProtectedRoute>
                                   <EquipmentPage />
                              </ProtectedRoute>
                         } />
                         <Route path="/equipment/*" element={
                              <ProtectedRoute>
                                   <EquipmentPage />
                              </ProtectedRoute>
                         } />
                         <Route path="/qr-scan" element={
                              <ProtectedRoute>
                                   <QRScanPage />
                              </ProtectedRoute>
                         } />
                         <Route path="/requests" element={
                              <ProtectedRoute>
                                   <RequestsPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/requests/*" element={
                              <ProtectedRoute>
                                   <RequestsPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/review-requests" element={
                              <ProtectedRoute>
                                   <ReviewRequestsPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/maintenance" element={
                              <ProtectedRoute>
                                   <MaintenancePageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/inventory" element={
                              <ProtectedRoute>
                                   <InventoryPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/locations" element={
                              <ProtectedRoute>
                                   <LocationsPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/my-asset-history" element={
                              <ProtectedRoute>
                                   <MyAssetHistoryPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/reports" element={
                              <ProtectedRoute>
                                   <ReportsPage />
                              </ProtectedRoute>
                         } />
                         <Route path="/users" element={
                              <ProtectedRoute>
                                   <UsersPage />
                              </ProtectedRoute>
                         } />
                         <Route path="/admin" element={
                              <AdminOnlyRoute>
                                   <AdminPageWrapper />
                              </AdminOnlyRoute>
                         } />
                         <Route path="/settings" element={
                              <ProtectedRoute>
                                   <SettingsPage />
                              </ProtectedRoute>
                         } />

                         {/* 404 */}
                         <Route path="*" element={<NotFoundPage />} />
                    </Routes>
               </AuthProvider>
          </ToastProvider>
          </I18nProvider>
          </BrowserRouter>
     );
};

// ============================================================================
// Mount App
// ============================================================================
const container = document.getElementById('app');
if (container) {
     const root = createRoot(container);
     root.render(<App />);
}
