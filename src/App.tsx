import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { UniversalAnalyzer } from './pages/UniversalAnalyzer';
import { PublicExamAnalyzer } from './pages/PublicExamAnalyzer';
import { FeaturesPage } from './pages/SEO/Features';
import { ExcelFilterPage } from './pages/SEO/ExcelFilter';
import { PricingPage } from './pages/SEO/Pricing';
import { SecurityPage } from './pages/SEO/Security';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<UniversalAnalyzer />} />
        <Route path="/exam-analyzer" element={<PublicExamAnalyzer />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/features/excel-filter" element={<ExcelFilterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Authenticated Workspace */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
