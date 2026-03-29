import './bootstrap';
import '../css/app.css';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { preferLocalizedMessage } from './services/api';

// Layout Components
import AdminLayout from './layouts/AdminLayout';

// Page Components
import Dashboard from './pages/Dashboard';
import UIKit from './pages/UIKit';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
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
import FeedbackPage from './pages/FeedbackPage';
import ReportPage from './pages/ReportPage';
import QRScanPage from './pages/QRScanPage';
import ContractsPage from './pages/ContractsPage';
import EmployeesPage from './pages/EmployeesPage';

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

const AdminHrRoute = ({ children }) => {
     const { user, loading } = useAuth();
     const location = useLocation();

     if (loading) {
          return <LoadingScreen />;
     }

     if (!user) {
          return <Navigate to="/login" state={{ from: location }} replace />;
     }

     if (user.role !== 'admin' && user.role !== 'hr') {
          return <Navigate to="/dashboard" replace />;
     }

     return children;
};

// ============================================================================
// Loading Screen
// ============================================================================
const LoadingScreen = () => {
     const { t } = useI18n();

     return (
          <div className="loading-screen">
               <div className="loading-spinner"></div>
               <p>{t('common.loading')}</p>
          </div>
     );
};

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
     const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
     const [password, setPassword] = useState('');
     const [passwordConfirmation, setPasswordConfirmation] = useState('');
     const [showPassword, setShowPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [error, setError] = useState(null);
     const [fieldErrors, setFieldErrors] = useState({});
     const [isLoading, setIsLoading] = useState(false);
     const [successMessage, setSuccessMessage] = useState(null);
     const [countdown, setCountdown] = useState(0);
     const { t } = useI18n();
     const navigate = useNavigate();
     
     // Refs for focus management
     const emailRef = React.useRef(null);
     const codeRefs = [
          React.useRef(null),
          React.useRef(null),
          React.useRef(null),
          React.useRef(null),
          React.useRef(null),
          React.useRef(null),
     ];
     const passwordRef = React.useRef(null);
     const confirmPasswordRef = React.useRef(null);

     useEffect(() => {
          if (countdown > 0) {
               const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
               return () => clearTimeout(timer);
          }
     }, [countdown]);

     const validateEmailStep = () => {
          const errors = {};
          if (!email.trim()) {
               errors.email = t('auth.emailRequired');
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
               errors.email = t('auth.emailInvalid');
          }
          setFieldErrors(errors);
          if (errors.email) {
               emailRef.current?.focus();
          }
          return Object.keys(errors).length === 0;
     };

     const validateResetStep = () => {
          const errors = {};
          const codeString = verificationCode.join('');
          
          if (codeString.length !== 6) {
               errors.verificationCode = t('auth.codeRequired');
          }
          if (!password) {
               errors.password = t('auth.passwordRequired');
          } else if (password.length < 8) {
               errors.password = t('auth.passwordTooShort');
          }
          if (!passwordConfirmation) {
               errors.passwordConfirmation = t('auth.confirmPasswordRequired');
          } else if (password && passwordConfirmation !== password) {
               errors.passwordConfirmation = t('auth.passwordMismatch');
               errors.password = t('auth.passwordMismatch');
          }
          
          setFieldErrors(errors);
          
          // Focus first invalid field
          if (errors.verificationCode) {
               codeRefs[0].current?.focus();
          } else if (errors.password && !errors.passwordConfirmation) {
               passwordRef.current?.focus();
          } else if (errors.passwordConfirmation) {
               confirmPasswordRef.current?.focus();
          }
          
          return Object.keys(errors).length === 0;
     };

     const handleRequestCode = async (e) => {
          e.preventDefault();
          setError(null);
          setSuccessMessage(null);
          setFieldErrors({});

          if (!validateEmailStep()) {
               return;
          }

          setIsLoading(true);

          try {
               await axios.post('/forgot-password/request', { email });
               // Always show generic success message (don't leak email existence)
               setSuccessMessage(t('auth.codeSentGeneric'));
               setStep(2);
               setCountdown(60);
          } catch (err) {
               // Generic error - don't leak email existence
               setSuccessMessage(t('auth.codeSentGeneric'));
               setStep(2);
               setCountdown(60);
          } finally {
               setIsLoading(false);
          }
     };

     const handleResetPassword = async (e) => {
          e.preventDefault();
          setError(null);
          setSuccessMessage(null);
          setFieldErrors({});

          if (!validateResetStep()) {
               return;
          }

          setIsLoading(true);

          try {
               const response = await axios.post('/forgot-password/reset', {
                    email,
                    verification_code: verificationCode.join(''),
                    password,
                    password_confirmation: passwordConfirmation,
               });
               setSuccessMessage(preferLocalizedMessage(response.data.message, t('auth.passwordResetSuccess')));
               setTimeout(() => {
                    navigate('/login');
               }, 2000);
          } catch (err) {
               const errors = err.response?.data?.errors;
               if (errors?.verification_code) {
                    setFieldErrors({
                         verificationCode: preferLocalizedMessage(errors.verification_code[0], t('auth.invalidVerificationCode')),
                    });
                    codeRefs[0].current?.focus();
               } else if (errors?.password) {
                    setFieldErrors({
                         password: preferLocalizedMessage(errors.password[0], t('auth.passwordRequirements')),
                    });
                    passwordRef.current?.focus();
               } else {
                    setError(preferLocalizedMessage(err.response?.data?.message, t('auth.failedToResetPassword')));
               }
          } finally {
               setIsLoading(false);
          }
     };

     const handleResendCode = async () => {
          if (countdown > 0 || isLoading) return;
          
          setError(null);
          setIsLoading(true);

          try {
               await axios.post('/forgot-password/request', { email });
               setSuccessMessage(t('auth.verificationCodeResent'));
               setCountdown(60);
          } catch (err) {
               // Still show success to not leak email existence
               setSuccessMessage(t('auth.verificationCodeResent'));
               setCountdown(60);
          } finally {
               setIsLoading(false);
          }
     };

     // OTP-style input handlers
     const handleCodeChange = (index, value) => {
          // Only allow digits
          const digit = value.replace(/\D/g, '').slice(-1);
          const newCode = [...verificationCode];
          newCode[index] = digit;
          setVerificationCode(newCode);
          
          // Clear field error on change
          if (fieldErrors.verificationCode) {
               setFieldErrors(prev => ({ ...prev, verificationCode: null }));
          }
          
          // Auto-focus next input
          if (digit && index < 5) {
               codeRefs[index + 1].current?.focus();
          }
     };

     const handleCodeKeyDown = (index, e) => {
          if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
               codeRefs[index - 1].current?.focus();
          }
     };

     const handleCodePaste = (e) => {
          e.preventDefault();
          const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
          const newCode = [...verificationCode];
          for (let i = 0; i < 6; i++) {
               newCode[i] = pastedData[i] || '';
          }
          setVerificationCode(newCode);
          // Focus last filled or first empty
          const focusIndex = Math.min(pastedData.length, 5);
          codeRefs[focusIndex].current?.focus();
     };

     const handleFieldChange = (field, value, setter) => {
          setter(value);
          if (fieldErrors[field]) {
               setFieldErrors(prev => ({ ...prev, [field]: null }));
          }
          if (error) {
               setError(null);
          }
     };

     return (
          <div className="auth-layout">
               <div className="auth-card">
                    <div className="auth-header auth-header-logo">
                         <img 
                              src="/images/mesoco_logo.png" 
                              alt="Logo Mesoco" 
                              className="auth-logo-image"
                         />
                    </div>

                    {step === 1 ? (
                         <form onSubmit={handleRequestCode} className="auth-form">
                              <h2 className="auth-title text-center">{t('auth.forgotPassword')}</h2>
                              <p className="auth-description text-center mb-6 text-sm text-gray-500">
                                   {t('auth.forgotPasswordDesc')}
                              </p>

                              {error && (
                                   <div className="alert alert-error mb-4">{error}</div>
                              )}

                              <div className="form-group">
                                   <label htmlFor="email">{t('auth.emailAddress')} <span className="text-error">*</span></label>
                                   <input
                                        ref={emailRef}
                                        id="email"
                                        type="email"
                                        className={`form-input ${fieldErrors.email ? 'form-input-error' : ''}`}
                                        value={email}
                                        onChange={e => handleFieldChange('email', e.target.value, setEmail)}
                                        placeholder={t('auth.enterEmail')}
                                        autoFocus
                                        disabled={isLoading}
                                        aria-invalid={!!fieldErrors.email}
                                        aria-describedby={fieldErrors.email ? 'email_error' : undefined}
                                   />
                                   {fieldErrors.email && (
                                        <p id="email_error" className="form-error-text">{fieldErrors.email}</p>
                                   )}
                              </div>

                              <button
                                   type="submit"
                                   className="btn btn-primary btn-block mb-4"
                                   disabled={isLoading}
                              >
                                   {isLoading ? (
                                        <>
                                             <span className="btn-spinner"></span>
                                             {t('auth.sending')}
                                        </>
                                   ) : t('auth.continue')}
                              </button>

                              <div className="text-center">
                                   <Link 
                                        to="/login" 
                                        className="text-sm text-primary hover:text-primary-hover hover:underline"
                                        tabIndex={isLoading ? -1 : 0}
                                   >
                                        {t('auth.backToLogin')}
                                   </Link>
                              </div>
                         </form>
                    ) : (
                         <form onSubmit={handleResetPassword} className="auth-form">
                              <h2 className="auth-title text-center">{t('auth.resetPassword')}</h2>
                              
                              {successMessage && (
                                   <div className="alert alert-success mb-4">{successMessage}</div>
                              )}

                              {error && (
                                   <div className="alert alert-error mb-4">{error}</div>
                              )}

                              <div className="form-group">
                                   <label htmlFor="password">{t('auth.newPassword')} <span className="text-error">*</span></label>
                                   <div className="form-input-wrapper">
                                        <input
                                             ref={passwordRef}
                                             id="password"
                                             type={showPassword ? 'text' : 'password'}
                                             className={`form-input form-input-with-icon ${fieldErrors.password ? 'form-input-error' : ''}`}
                                             value={password}
                                             onChange={e => handleFieldChange('password', e.target.value, setPassword)}
                                             placeholder={t('auth.enterNewPassword')}
                                             disabled={isLoading}
                                             aria-invalid={!!fieldErrors.password}
                                             aria-describedby={fieldErrors.password ? 'password_error' : 'password_hint'}
                                        />
                                        <button
                                             type="button"
                                             className="form-input-icon-btn"
                                             onClick={() => setShowPassword(!showPassword)}
                                             aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                                             tabIndex={-1}
                                        >
                                             {showPassword ? (
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                       <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                  </svg>
                                             ) : (
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  </svg>
                                             )}
                                        </button>
                                   </div>
                                   {fieldErrors.password ? (
                                        <p id="password_error" className="form-error-text">{fieldErrors.password}</p>
                                   ) : (
                                        <p id="password_hint" className="text-xs text-gray-500 mt-1">
                                             {t('auth.passwordRequirements')}
                                        </p>
                                   )}
                              </div>

                              <div className="form-group">
                                   <label htmlFor="password_confirmation">{t('auth.confirmPassword')} <span className="text-error">*</span></label>
                                   <div className="form-input-wrapper">
                                        <input
                                             ref={confirmPasswordRef}
                                             id="password_confirmation"
                                             type={showConfirmPassword ? 'text' : 'password'}
                                             className={`form-input form-input-with-icon ${fieldErrors.passwordConfirmation ? 'form-input-error' : ''}`}
                                             value={passwordConfirmation}
                                             onChange={e => handleFieldChange('passwordConfirmation', e.target.value, setPasswordConfirmation)}
                                             placeholder={t('auth.confirmNewPassword')}
                                             disabled={isLoading}
                                             aria-invalid={!!fieldErrors.passwordConfirmation}
                                             aria-describedby={fieldErrors.passwordConfirmation ? 'confirm_password_error' : undefined}
                                        />
                                        <button
                                             type="button"
                                             className="form-input-icon-btn"
                                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                             aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                                             tabIndex={-1}
                                        >
                                             {showConfirmPassword ? (
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                       <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                  </svg>
                                             ) : (
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  </svg>
                                             )}
                                        </button>
                                   </div>
                                   {fieldErrors.passwordConfirmation && (
                                        <p id="confirm_password_error" className="form-error-text">{fieldErrors.passwordConfirmation}</p>
                                   )}
                              </div>

                              <div className="form-group">
                                   <label>{t('auth.verificationCode')} <span className="text-error">*</span></label>
                                   <div className="otp-input-group" onPaste={handleCodePaste}>
                                        {verificationCode.map((digit, index) => (
                                             <input
                                                  key={index}
                                                  ref={codeRefs[index]}
                                                  type="text"
                                                  inputMode="numeric"
                                                  maxLength="1"
                                                  className={`otp-input ${fieldErrors.verificationCode ? 'otp-input-error' : ''}`}
                                                  value={digit}
                                                  onChange={e => handleCodeChange(index, e.target.value)}
                                                  onKeyDown={e => handleCodeKeyDown(index, e)}
                                                  disabled={isLoading}
                                                  aria-label={`${t('auth.verificationCode')} ${index + 1}`}
                                                  aria-invalid={!!fieldErrors.verificationCode}
                                             />
                                        ))}
                                   </div>
                                   {fieldErrors.verificationCode && (
                                        <p className="form-error-text text-center">{fieldErrors.verificationCode}</p>
                                   )}
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

                              <button
                                   type="submit"
                                   className="btn btn-primary btn-block mb-4"
                                   disabled={isLoading}
                              >
                                   {isLoading ? (
                                        <>
                                             <span className="btn-spinner"></span>
                                             {t('auth.resetting')}
                                        </>
                                   ) : t('auth.resetPasswordBtn')}
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
     const [showPassword, setShowPassword] = useState(false);
     const [remember, setRemember] = useState(false);
     const [error, setError] = useState(null);
     const [fieldErrors, setFieldErrors] = useState({});
     const [isLoading, setIsLoading] = useState(false);
     const { login } = useAuth();
     const { t } = useI18n();
     const navigate = useNavigate();
     const location = useLocation();
     const employeeCodeRef = React.useRef(null);
     const passwordRef = React.useRef(null);

     const from = location.state?.from?.pathname || '/dashboard';

     const validateFields = () => {
          const errors = {};
          if (!employeeCode.trim()) {
               errors.employeeCode = t('auth.employeeIdRequired');
          }
          if (!password) {
               errors.password = t('auth.passwordRequired');
          }
          setFieldErrors(errors);
          
          // Focus first invalid field
          if (errors.employeeCode) {
               employeeCodeRef.current?.focus();
          } else if (errors.password) {
               passwordRef.current?.focus();
          }
          
          return Object.keys(errors).length === 0;
     };

     const handleSubmit = async (e) => {
          e.preventDefault();
          setError(null);
          setFieldErrors({});

          if (!validateFields()) {
               return;
          }

          setIsLoading(true);

          try {
               await login(employeeCode, password, remember);
               navigate(from, { replace: true });
          } catch (err) {
               // Generic error message - do not leak user existence
               setError(t('auth.invalidCredentialsGeneric'));
          } finally {
               setIsLoading(false);
          }
     };

     const handleFieldChange = (field, value, setter) => {
          setter(value);
          if (fieldErrors[field]) {
               setFieldErrors(prev => ({ ...prev, [field]: null }));
          }
          if (error) {
               setError(null);
          }
     };

     return (
          <div className="auth-layout">
               <div className="auth-card">
                    <div className="auth-header auth-header-logo">
                         <img 
                              src="/images/mesoco_logo.png" 
                              alt="Logo Mesoco" 
                              className="auth-logo-image"
                         />
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                         <h2 className="auth-title text-center">{t('auth.welcomeBack')}</h2>
                         <p className="auth-description text-center mb-6 text-sm text-gray-500">{t('auth.signInToContinue')}</p>

                         {error && (
                              <div className="alert alert-error mb-4">{error}</div>
                         )}

                         <div className="form-group">
                              <label htmlFor="employee_code">{t('auth.employeeId')}</label>
                              <input
                                   ref={employeeCodeRef}
                                   id="employee_code"
                                   type="text"
                                   className={`form-input ${fieldErrors.employeeCode ? 'form-input-error' : ''}`}
                                   value={employeeCode}
                                   onChange={e => handleFieldChange('employeeCode', e.target.value, setEmployeeCode)}
                                   placeholder={t('auth.enterEmployeeId')}
                                   autoFocus
                                   disabled={isLoading}
                                   aria-invalid={!!fieldErrors.employeeCode}
                                   aria-describedby={fieldErrors.employeeCode ? 'employee_code_error' : undefined}
                              />
                              {fieldErrors.employeeCode && (
                                   <p id="employee_code_error" className="form-error-text">{fieldErrors.employeeCode}</p>
                              )}
                         </div>

                         <div className="form-group">
                              <label htmlFor="password">{t('auth.password')}</label>
                              <div className="form-input-wrapper">
                                   <input
                                        ref={passwordRef}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input form-input-with-icon ${fieldErrors.password ? 'form-input-error' : ''}`}
                                        value={password}
                                        onChange={e => handleFieldChange('password', e.target.value, setPassword)}
                                        placeholder={t('auth.enterPassword')}
                                        disabled={isLoading}
                                        aria-invalid={!!fieldErrors.password}
                                        aria-describedby={fieldErrors.password ? 'password_error' : undefined}
                                   />
                                   <button
                                        type="button"
                                        className="form-input-icon-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                                        tabIndex={-1}
                                   >
                                        {showPassword ? (
                                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                             </svg>
                                        ) : (
                                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                             </svg>
                                        )}
                                   </button>
                              </div>
                              {fieldErrors.password && (
                                   <p id="password_error" className="form-error-text">{fieldErrors.password}</p>
                              )}
                         </div>

                         <div className="form-group flex items-center justify-between mb-6">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                   <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                        checked={remember}
                                        onChange={e => setRemember(e.target.checked)}
                                        disabled={isLoading}
                                   />
                                   <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
                              </label>
                              <Link 
                                   to="/forgot-password" 
                                   className="text-sm text-primary hover:text-primary-hover hover:underline"
                                   tabIndex={isLoading ? -1 : 0}
                              >
                                   {t('auth.forgotPassword')}?
                              </Link>
                         </div>

                         <button
                              type="submit"
                              className="btn btn-primary btn-block"
                              disabled={isLoading}
                         >
                              {isLoading ? (
                                   <>
                                        <span className="btn-spinner"></span>
                                        {t('auth.signingIn')}
                                   </>
                              ) : t('auth.continue')}
                         </button>
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
     const { t } = useI18n();

     return (
          <AdminLayoutWrapper 
               title={t('nav.dashboard')} 
               breadcrumbs={[{ label: t('nav.dashboard') }]}
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
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.profile')} 
               breadcrumbs={[{ label: t('nav.profile') }]}
          >
               <ProfilePage user={user} />
          </AdminLayoutWrapper>
     );
};

const ChangePasswordPageWrapper = () => {
     const { user, logout } = useAuth();
     const { t } = useI18n();
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
          <AdminLayoutWrapper 
               title={t('auth.changePassword')} 
               breadcrumbs={[{ label: t('auth.changePassword') }]}
          >
               <ChangePasswordPage user={user} onLogout={handleLogout} />
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

const EquipmentPage = () => {
     const { t } = useI18n();

     return (
          <AdminLayoutWrapper 
               title={t('nav.equipment')} 
               breadcrumbs={[{ label: t('nav.equipment') }]}
          >
               <div className="placeholder-state">
                    <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                         <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    <h3>{t('placeholderPages.equipmentTitle')}</h3>
                    <p>{t('placeholderPages.equipmentDescription')}</p>
                    <span className="coming-soon">{t('placeholderPages.comingSoon')}</span>
               </div>
          </AdminLayoutWrapper>
     );
};

const QRScanPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.qrScan')}
               breadcrumbs={[{ label: t('nav.qrScan') }]}
          >
               <QRScanPage user={user} />
          </AdminLayoutWrapper>
     );
};

const RequestsPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.requests')} 
               breadcrumbs={[{ label: t('nav.requests') }]}
          >
               <RequestsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const ReviewRequestsPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.reviewRequests')} 
               breadcrumbs={[{ label: t('nav.reviewRequests') }]}
          >
               <ReviewRequestsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const MaintenancePageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.maintenance')} 
               breadcrumbs={[{ label: t('nav.maintenance') }]}
          >
               <MaintenancePage user={user} />
          </AdminLayoutWrapper>
     );
};

const InventoryPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.inventory')} 
               breadcrumbs={[{ label: t('nav.inventory') }]}
          >
               <InventoryPage user={user} />
          </AdminLayoutWrapper>
     );
};

const LocationsPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.locations')} 
               breadcrumbs={[{ label: t('nav.locations') }]}
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

const ReportPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.reports')}
               breadcrumbs={[{ label: t('nav.reports') }]}
          >
               <ReportPage user={user} />
          </AdminLayoutWrapper>
     );
};

const FeedbackPageWrapper = () => {
     const { user } = useAuth();
     const { t } = useI18n();
     return (
          <AdminLayoutWrapper 
               title={t('nav.feedback')}
               breadcrumbs={[{ label: t('nav.feedback') }]}
          >
               <FeedbackPage user={user} />
          </AdminLayoutWrapper>
     );
};

const ContractsPageWrapper = () => {
     const { user } = useAuth();
     const navigate = useNavigate();
     const { t } = useI18n();
     
     // RBAC check - only admin can access
     useEffect(() => {
          if (user && user.role !== 'admin') {
               navigate('/dashboard', { replace: true });
          }
     }, [user, navigate]);
     
     if (!user || user.role !== 'admin') {
          return null;
     }
     
     return (
          <AdminLayoutWrapper 
               title={t('nav.contracts')}
               breadcrumbs={[{ label: t('nav.contracts') }]}
          >
               <ContractsPage user={user} />
          </AdminLayoutWrapper>
     );
};

const EmployeesPageWrapper = () => {
     const { user } = useAuth();
     const navigate = useNavigate();
     const { t } = useI18n();
     
     // RBAC check - only admin/hr can access
     useEffect(() => {
          if (user && user.role !== 'admin' && user.role !== 'hr') {
               navigate('/dashboard', { replace: true });
          }
     }, [user, navigate]);
     
     if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
          return null;
     }
     
     return (
          <AdminLayoutWrapper 
               title={t('nav.employees')}
               breadcrumbs={[{ label: t('nav.employees') }]}
          >
               <EmployeesPage user={user} />
          </AdminLayoutWrapper>
     );
};

const UsersPage = () => {
     const { t } = useI18n();

     return (
          <AdminLayoutWrapper 
               title={t('nav.users')} 
               breadcrumbs={[{ label: t('nav.users') }]}
          >
               <div className="placeholder-state">
                    <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                         <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                         <circle cx="9" cy="7" r="4" />
                         <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                         <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <h3>{t('placeholderPages.usersTitle')}</h3>
                    <p>{t('placeholderPages.usersDescription')}</p>
                    <span className="coming-soon">{t('placeholderPages.comingSoon')}</span>
               </div>
          </AdminLayoutWrapper>
     );
};

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

const SettingsPage = () => {
     const { t } = useI18n();

     return (
          <AdminLayoutWrapper 
               title={t('nav.settings')} 
               breadcrumbs={[{ label: t('nav.settings') }]}
          >
               <div className="placeholder-state">
                    <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                         <circle cx="12" cy="12" r="3" />
                         <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4" />
                    </svg>
                    <h3>{t('placeholderPages.settingsTitle')}</h3>
                    <p>{t('placeholderPages.settingsDescription')}</p>
                    <span className="coming-soon">{t('placeholderPages.comingSoon')}</span>
               </div>
          </AdminLayoutWrapper>
     );
};

const NotFoundPage = () => {
     const { t } = useI18n();

     return (
          <div className="error-page">
               <div className="error-content">
                    <h1 className="error-code">404</h1>
                    <h2 className="error-title">{t('notFound.title')}</h2>
                    <p className="error-message">{t('notFound.message')}</p>
                    <Link to="/dashboard" className="btn btn-primary">
                         {t('notFound.backToDashboard')}
                    </Link>
               </div>
          </div>
     );
};

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
                              <Route path="/change-password" element={
                                   <ProtectedRoute>
                                        <ChangePasswordPageWrapper />
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
                                   <QRScanPageWrapper />
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
                                   <ReportPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/feedback" element={
                              <ProtectedRoute>
                                   <FeedbackPageWrapper />
                              </ProtectedRoute>
                         } />
                         <Route path="/contracts" element={
                              <AdminOnlyRoute>
                                   <ContractsPageWrapper />
                              </AdminOnlyRoute>
                         } />
                         <Route path="/employees" element={
                              <AdminHrRoute>
                                   <EmployeesPageWrapper />
                              </AdminHrRoute>
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
