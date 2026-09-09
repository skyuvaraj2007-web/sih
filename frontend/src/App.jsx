import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NexusAIModal from './components/NexusAIModal';
import Toast from './components/Toast';

// Pages
import RoleGateway from './pages/RoleGateway';
import StudentLogin from './pages/StudentLogin';
import IndustryLogin from './pages/IndustryLogin';
import InstitutionLogin from './pages/InstitutionLogin';
import MySkills from './pages/MySkills';
import SkillAssessment from './pages/SkillAssessment';
import MyLearning from './pages/MyLearning';
import LearningProgressAnalytics from './pages/LearningProgressAnalytics';
import AdvancedTech from './pages/AdvancedTech';
import TechDeepDive from './pages/TechDeepDive';
import CourseEnrollment from './pages/CourseEnrollment';
import MyProjects from './pages/MyProjects';
import StudentDashboard from './pages/StudentDashboard';
import Opportunities from './pages/Opportunities';
import DigitalPassport from './pages/DigitalPassport';
import MyProfile from './pages/MyProfile';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import Notifications from './pages/Notifications';
import SearchResults from './pages/SearchResults';
import InstitutionConsole from './pages/InstitutionConsole';
import IndustryPortal from './pages/IndustryPortal';
import StudentActivation from './pages/StudentActivation';
import StudentCollegePage from './pages/StudentCollegePage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// ════════════════════════════════════════════════════════════════
// URL SYNCHRONIZATION & ROLE NORMALIZATION UTILITIES
// ════════════════════════════════════════════════════════════════
export const normalizeRole = (role) => {
  if (!role) return 'student';
  const r = String(role).toLowerCase();
  if (r === 'industry' || r === 'company') return 'company';
  if (r === 'institution') return 'institution';
  return 'student';
};

export const pageToPath = (page, role, tab = 'dashboard') => {
  const normRole = normalizeRole(role);
  if (page === 'role-select') return '/auth/select-role';
  if (page === 'student-login') return '/auth/student-login';
  if (page === 'institution-login') return '/auth/institution-login';
  if (page === 'industry-login') return '/auth/company-login';
  if (page === 'activate') return '/activate';
  if (page === 'verify-otp') return '/auth/verify-otp';
  if (page === 'forgot-password') return '/auth/forgot-password';

  if (normRole === 'student') {
    if (page === 'home') return '/student/home';
    if (page === 'college') return '/student/college';
    if (page === 'skills') return '/student/skills';
    if (page === 'assessment') return '/student/assessment';
    if (page === 'learning') return '/student/learning';
    if (page === 'learning-progress') return '/student/learning-progress';
    if (page === 'projects') return '/student/projects';
    if (page === 'opportunities') return '/student/opportunities';
    if (page === 'passport') return '/student/passport';
    if (page === 'profile') return '/student/profile';
    if (page === 'settings') return '/student/settings';
    if (page === 'notifications') return '/student/notifications';
    if (page === 'help') return '/student/help';
    if (page === 'search') return '/student/search';
    if (page === 'enroll') return '/student/enroll';
    if (page === 'advanced-tech') return '/student/advanced-tech';
    if (page === 'advanced-tech-deepdive') return '/student/advanced-tech-deepdive';
    return '/student/home';
  }

  if (normRole === 'institution') {
    if (page === 'institution-console') return '/institution/telemetry';
    if (page === 'institution-readiness') return '/institution/readiness';
    if (page === 'institution-students') return '/institution/students';
    if (page === 'institution-assessments') return '/institution/assessments';
    if (page === 'institution-skill-analytics') return '/institution/skill-analytics';
    if (page === 'institution-industry-requests') return '/institution/industry-requests';
    if (page === 'institution-company-directory' || page === 'institution-companies') return '/institution/companies';
    if (page === 'institution-company-intelligence') return '/institution/company-intelligence';
    if (page === 'institution-company-opportunities') return '/institution/company-opportunities';
    if (page === 'institution-matching') return '/institution/matching';
    if (page === 'institution-skill-gap') return '/institution/skill-gap';
    if (page === 'institution-courses') return '/institution/courses';
    if (page === 'institution-course-certificates') return '/institution/course-certificates';
    if (page === 'institution-skill-mapping') return '/institution/skill-mapping';
    if (page === 'institution-certificates' || page === 'institution-proofs') return '/institution/proofs';
    if (page === 'institution-placement') return '/institution/placement';
    if (page === 'institution-recruitment-drives') return '/institution/recruitment-drives';
    if (page === 'institution-analytics') return '/institution/analytics';
    if (page === 'institution-industry-demand') return '/institution/industry-demand';
    if (page === 'institution-skill-trends') return '/institution/skill-trends';
    if (page === 'profile') return '/institution/profile';
    if (page === 'settings') return '/institution/settings';
    if (page === 'notifications') return '/institution/notifications';
    if (page === 'help') return '/institution/help';
    if (page === 'search') return '/institution/search';
    return '/institution/telemetry';
  }

  if (normRole === 'company') {
    if (page === 'industry-portal') {
      if (tab === 'students' || tab === 'talent-search') return '/company/students';
      if (tab === 'access-requests' || tab === 'requests') return '/company/access-requests';
      if (tab === 'authorized-students') return '/company/authorized-students';
      if (tab === 'internships') return '/company/internships';
      if (tab === 'apprenticeships') return '/company/apprenticeships';
      if (tab === 'jobs') return '/company/jobs';
      if (tab === 'opportunities') return '/company/opportunities';
      if (tab === 'applications') return '/company/applications';
      if (tab === 'shortlisted') return '/company/shortlisted';
      if (tab === 'colleges') return '/company/colleges';
      if (tab === 'courses') return '/company/courses';
      if (tab === 'certificates') return '/company/certificates';
      if (tab === 'ai-matching' || tab === 'talent-matching') return '/company/ai-matching';
      if (tab === 'talent-pools') return '/company/talent-pools';
      if (tab === 'analytics') return '/company/analytics';
      if (tab === 'messages') return '/company/messages';
      if (tab === 'dashboard' || tab === 'overview') return '/company/overview';
      return '/company/overview';
    }
    if (page === 'profile') return '/company/settings';
    if (page === 'settings') return '/company/settings';
    if (page === 'notifications') return '/company/overview';
    if (page === 'help') return '/company/overview';
    if (page === 'search') return '/company/students';
    return '/company/overview';
  }

  return '/student/home';
};

export const resolvePath = (pathname, currentUser) => {
  const path = (pathname || '/').toLowerCase().replace(/\/$/, '') || '/';
  const role = currentUser ? normalizeRole(currentUser.role) : null;

  // Unauthenticated / Auth routes
  if (path === '' || path === '/' || path === '/role-select' || path === '/auth/select-role') {
    return { page: 'role-select', isAuth: true };
  }
  if (path === '/student-login' || path === '/auth/student-login') {
    return { page: 'student-login', isAuth: true };
  }
  if (path === '/institution-login' || path === '/auth/institution-login') {
    return { page: 'institution-login', isAuth: true };
  }
  if (path === '/industry-login' || path === '/company-login' || path === '/auth/company-login') {
    return { page: 'industry-login', isAuth: true };
  }
  if (path === '/activate') {
    return { page: 'activate', isAuth: true };
  }
  if (path === '/verify-otp' || path === '/auth/verify-otp') {
    return { page: 'verify-otp', isAuth: true };
  }
  if (path === '/forgot-password' || path === '/auth/forgot-password') {
    return { page: 'forgot-password', isAuth: true };
  }

  // If user is NOT logged in and attempting to visit any protected route
  if (!currentUser) {
    return { page: 'role-select', redirectReason: 'unauthenticated' };
  }

  // Student URL route handling
  if (path.startsWith('/student')) {
    if (role !== 'student') {
      return { page: role === 'institution' ? 'institution-console' : 'industry-portal', redirectReason: 'cross-role' };
    }
    if (path === '/student/college' || path === '/my-college') return { page: 'college' };
    if (path === '/student/skills') return { page: 'skills' };
    if (path === '/student/assessment') return { page: 'assessment' };
    if (path === '/student/learning') return { page: 'learning' };
    if (path === '/student/learning-progress') return { page: 'learning-progress' };
    if (path === '/student/projects') return { page: 'projects' };
    if (path === '/student/opportunities') return { page: 'opportunities' };
    if (path === '/student/passport') return { page: 'passport' };
    if (path === '/student/profile') return { page: 'profile' };
    if (path === '/student/settings') return { page: 'settings' };
    if (path === '/student/notifications') return { page: 'notifications' };
    if (path === '/student/help') return { page: 'help' };
    if (path === '/student/search') return { page: 'search' };
    if (path === '/student/enroll') return { page: 'enroll' };
    if (path === '/student/advanced-tech') return { page: 'advanced-tech' };
    if (path === '/student/advanced-tech-deepdive') return { page: 'advanced-tech-deepdive' };
    return { page: 'home' };
  }

  // Institution URL route handling
  if (path.startsWith('/institution')) {
    if (role !== 'institution') {
      return { page: role === 'company' ? 'industry-portal' : 'home', redirectReason: 'cross-role' };
    }
    if (path === '/institution/readiness') return { page: 'institution-readiness' };
    if (path === '/institution/skill-analytics') return { page: 'institution-skill-analytics' };
    if (path === '/institution/students') return { page: 'institution-students' };
    if (path === '/institution/assessments') return { page: 'institution-assessments' };
    if (path === '/institution/industry-requests' || path === '/institution/requests') return { page: 'institution-industry-requests' };
    if (path === '/institution/companies') return { page: 'institution-company-directory' };
    if (path === '/institution/company-intelligence') return { page: 'institution-company-intelligence' };
    if (path === '/institution/company-opportunities') return { page: 'institution-company-opportunities' };
    if (path === '/institution/matching') return { page: 'institution-matching' };
    if (path === '/institution/skill-gap') return { page: 'institution-skill-gap' };
    if (path === '/institution/courses') return { page: 'institution-courses' };
    if (path === '/institution/course-certificates') return { page: 'institution-course-certificates' };
    if (path === '/institution/skill-mapping') return { page: 'institution-skill-mapping' };
    if (path === '/institution/proofs' || path === '/institution/certificates') return { page: 'institution-proofs' };
    if (path === '/institution/placement') return { page: 'institution-placement' };
    if (path === '/institution/recruitment-drives') return { page: 'institution-recruitment-drives' };
    if (path === '/institution/analytics') return { page: 'institution-analytics' };
    if (path === '/institution/industry-demand') return { page: 'institution-industry-demand' };
    if (path === '/institution/skill-trends') return { page: 'institution-skill-trends' };
    if (path === '/institution/profile') return { page: 'profile' };
    if (path === '/institution/settings') return { page: 'settings' };
    if (path === '/institution/notifications') return { page: 'notifications' };
    if (path === '/institution/help') return { page: 'help' };
    return { page: 'institution-console' };
  }

  // Company URL route handling
  if (path.startsWith('/company')) {
    if (role !== 'company') {
      return { page: role === 'institution' ? 'institution-console' : 'home', redirectReason: 'cross-role' };
    }
    if (path.startsWith('/company/students/')) {
      const studentId = path.split('/company/students/')[1];
      return { page: 'industry-portal', companyTab: 'student-profile', studentId, isCompanyRoute: true };
    }
    if (path === '/company/students' || path === '/company/talent-search') return { page: 'industry-portal', companyTab: 'students', isCompanyRoute: true };
    if (path === '/company/access-requests' || path === '/company/requests') return { page: 'industry-portal', companyTab: 'access-requests', isCompanyRoute: true };
    if (path === '/company/authorized-students') return { page: 'industry-portal', companyTab: 'authorized-students', isCompanyRoute: true };
    if (path === '/company/internships') return { page: 'industry-portal', companyTab: 'internships', isCompanyRoute: true };
    if (path === '/company/apprenticeships') return { page: 'industry-portal', companyTab: 'apprenticeships', isCompanyRoute: true };
    if (path === '/company/jobs') return { page: 'industry-portal', companyTab: 'jobs', isCompanyRoute: true };
    if (path === '/company/opportunities') return { page: 'industry-portal', companyTab: 'opportunities', isCompanyRoute: true };
    if (path === '/company/applications') return { page: 'industry-portal', companyTab: 'applications', isCompanyRoute: true };
    if (path === '/company/shortlisted') return { page: 'industry-portal', companyTab: 'shortlisted', isCompanyRoute: true };
    if (path === '/company/colleges') return { page: 'industry-portal', companyTab: 'colleges', isCompanyRoute: true };
    if (path === '/company/courses') return { page: 'industry-portal', companyTab: 'courses', isCompanyRoute: true };
    if (path === '/company/certificates') return { page: 'industry-portal', companyTab: 'certificates', isCompanyRoute: true };
    if (path === '/company/ai-matching' || path === '/company/talent-matching') return { page: 'industry-portal', companyTab: 'ai-matching', isCompanyRoute: true };
    if (path === '/company/talent-pools') return { page: 'industry-portal', companyTab: 'talent-pools', isCompanyRoute: true };
    if (path === '/company/analytics') return { page: 'industry-portal', companyTab: 'analytics', isCompanyRoute: true };
    if (path === '/company/messages') return { page: 'industry-portal', companyTab: 'messages', isCompanyRoute: true };
    if (path === '/company/overview' || path === '/company/dashboard') return { page: 'industry-portal', companyTab: 'dashboard', isCompanyRoute: true };
    if (path === '/company/settings' || path === '/company/profile') return { page: 'industry-portal', companyTab: 'settings', isCompanyRoute: true };
    return { page: 'industry-portal', companyTab: 'dashboard', isCompanyRoute: true };
  }

  // Direct top-level student routes (accessible directly via URL bar)
  if (path === '/learning' || path === '/my-learning' || path === '/courses') {
    if (role === 'institution') return { page: 'institution-console' };
    if (role === 'company') return { page: 'industry-portal', companyTab: 'courses', isCompanyRoute: true };
    return { page: 'learning' };
  }
  if (path === '/skills' || path === '/my-skills') {
    return { page: role === 'institution' ? 'institution-console' : role === 'company' ? 'industry-portal' : 'skills' };
  }
  if (path === '/assessment' || path === '/assessments') {
    return { page: role === 'institution' ? 'institution-console' : role === 'company' ? 'industry-portal' : 'assessment' };
  }
  if (path === '/projects' || path === '/my-projects') {
    return { page: role === 'institution' ? 'institution-console' : role === 'company' ? 'industry-portal' : 'projects' };
  }
  if (path === '/opportunities') {
    return { page: role === 'institution' ? 'institution-console' : role === 'company' ? 'industry-portal' : 'opportunities' };
  }
  if (path === '/passport' || path === '/digital-passport') {
    return { page: role === 'institution' ? 'institution-console' : role === 'company' ? 'industry-portal' : 'passport' };
  }

  // Direct shared routes (e.g. /profile, /settings, /notifications, /help)
  if (path === '/profile') return { page: 'profile' };
  if (path === '/settings') return { page: 'settings' };
  if (path === '/notifications') return { page: 'notifications' };
  if (path === '/help') return { page: 'help' };
  if (path === '/search') return { page: 'search' };

  // Fallback to role-specific dashboard
  return {
    page: role === 'institution' ? 'institution-console' : role === 'company' ? 'industry-portal' : 'home'
  };
};

import { authService } from './services/authService';

export default function App() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // 1. Session state initialization from localStorage with role normalization
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexus_auth_user');
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      return {
        ...parsed,
        role: normalizeRole(parsed.role),
        currentRole: normalizeRole(parsed.role),
        userId: parsed.userId || parsed.id || (normalizeRole(parsed.role) === 'institution' ? 'INS001' : normalizeRole(parsed.role) === 'company' ? 'COM001' : 'STU001'),
        currentUserId: parsed.currentUserId || parsed.userId || parsed.id || (normalizeRole(parsed.role) === 'institution' ? 'INS001' : normalizeRole(parsed.role) === 'company' ? 'COM001' : 'STU001')
      };
    } catch {
      return null;
    }
  });

  // Verify session on mount with backend /api/auth/me
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      try {
        const res = await authService.getCurrentUser();
        if (!isMounted) return;
        if (res.success && res.user) {
          const normalized = {
            ...res.user,
            role: normalizeRole(res.user.role),
            currentRole: normalizeRole(res.user.role),
            userId: res.user.userId || res.user.id || res.user.studentId || res.user.institutionId || res.user.companyId,
            currentUserId: res.user.currentUserId || res.user.userId || res.user.id || res.user.studentId || res.user.institutionId || res.user.companyId
          };
          setUser(normalized);

          // If currently on an auth page, redirect to the user's portal
          const path = window.location.pathname.toLowerCase();
          const authPaths = ['/', '/auth/select-role', '/role-select', '/student-login', '/auth/student-login', '/institution-login', '/auth/institution-login', '/industry-login', '/company-login', '/auth/company-login', '/verify-otp', '/auth/verify-otp', '/forgot-password', '/auth/forgot-password'];
          if (authPaths.includes(path)) {
            const normRole = normalized.role;
            const targetPage = normRole === 'institution' ? 'institution-console' : normRole === 'company' ? 'industry-portal' : 'home';
            const targetPath = pageToPath(targetPage, normRole);
            setActivePage(targetPage);
            if (normRole === 'company') setCompanyTab('dashboard');
            try { window.history.replaceState(null, '', targetPath); } catch {}
          }
        } else {
          // Unauthenticated
          setUser(null);
          const path = window.location.pathname.toLowerCase();
          const authPaths = ['/', '/auth/select-role', '/role-select', '/student-login', '/auth/student-login', '/institution-login', '/auth/institution-login', '/industry-login', '/company-login', '/auth/company-login', '/verify-otp', '/auth/verify-otp', '/forgot-password', '/auth/forgot-password'];
          if (!authPaths.includes(path)) {
            setActivePage('role-select');
            try { window.history.replaceState(null, '', '/auth/select-role'); } catch {}
          }
        }
      } catch (err) {
        console.warn('Session verification error:', err);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    verifySession();
    return () => { isMounted = false; };
  }, []);

  // Listen for live profile updates
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setUser(prev => prev ? ({
          ...prev,
          name: e.detail.name || prev.name,
          email: e.detail.email || prev.email,
          avatar: e.detail.avatar || prev.avatar,
          headline: e.detail.desiredRole || prev.headline
        }) : prev);
      }
    };
    window.addEventListener('nexus_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('nexus_profile_updated', handleProfileUpdate);
  }, []);

  // 2. Initial route determination based on URL path and session state
  const [activePage, setActivePage] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexus_auth_user');
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      const resolved = resolvePath(window.location.pathname, parsed);

      if (resolved.redirectReason === 'cross-role' && parsed) {
        const fallbackPath = pageToPath(resolved.page, parsed.role);
        try { window.history.replaceState(null, '', fallbackPath); } catch {}
      } else if (resolved.redirectReason === 'unauthenticated') {
        try { window.history.replaceState(null, '', '/auth/select-role'); } catch {}
      } else {
        const targetPath = pageToPath(resolved.page, parsed ? parsed.role : null, resolved.companyTab);
        try { window.history.replaceState(null, '', targetPath); } catch {}
      }
      return resolved.page;
    } catch {
      return 'role-select';
    }
  });

  // Active Company Portal Tab state
  const [companyTab, setCompanyTab] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexus_auth_user');
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      const resolved = resolvePath(window.location.pathname, parsed);
      return resolved.companyTab || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [settingsTab, setSettingsTab] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((toastObj) => {
    setToast(toastObj);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 3. Centralized Logout Handler
  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setActivePage('role-select');
    try {
      window.history.pushState({ page: 'role-select' }, '', '/auth/select-role');
    } catch {}
    showToast({
      title: 'Signed Out',
      message: 'You have been safely signed out. Please choose your sector to log in.',
      type: 'info'
    });
  }, [showToast]);


  // 4. Role-based Route Guarded Navigation & URL Synchronization
  const navigateGuarded = useCallback((targetPage, optionalTab) => {
    const authPages = ['role-select', 'student-login', 'industry-login', 'institution-login', 'activate', 'verify-otp', 'forgot-password'];

    // If not authenticated, restrict strictly to auth routes
    if (!user) {
      if (authPages.includes(targetPage)) {
        setActivePage(targetPage);
        const p = pageToPath(targetPage, null);
        try { window.history.pushState({ page: targetPage }, '', p); } catch {}
      } else {
        setActivePage('role-select');
        try { window.history.pushState({ page: 'role-select' }, '', '/auth/select-role'); } catch {}
        showToast({
          title: 'Authentication Required',
          message: 'Please choose your sector and log in to access this page.',
          type: 'warning'
        });
      }
      return;
    }

    const normRole = normalizeRole(user.role);

    // Role-specific route protection
    if (normRole === 'student') {
      const isForbidden = targetPage === 'institution-console' || targetPage === 'industry-portal' || targetPage.startsWith('institution-');
      if (isForbidden) {
        setActivePage('home');
        try { window.history.pushState({ page: 'home' }, '', '/student/home'); } catch {}
        showToast({
          title: 'Access Restricted',
          message: 'Student accounts cannot access Institutional or Industry portals.',
          type: 'warning'
        });
        return;
      }
    } else if (normRole === 'institution') {
      const isAllowed = targetPage.startsWith('institution-') || [
        'profile', 'settings', 'notifications', 'help', 'search'
      ].includes(targetPage);
      if (!isAllowed) {
        setActivePage('institution-console');
        try { window.history.pushState({ page: 'institution-console' }, '', '/institution/telemetry'); } catch {}
        showToast({
          title: 'Access Restricted',
          message: 'Institution accounts cannot access Student or Industry views.',
          type: 'warning'
        });
        return;
      }
    } else if (normRole === 'company') {
      const isAllowed = targetPage === 'industry-portal' || [
        'profile', 'settings', 'notifications', 'help', 'search'
      ].includes(targetPage);
      if (!isAllowed) {
        setActivePage('industry-portal');
        try { window.history.pushState({ page: 'industry-portal' }, '', '/company/dashboard'); } catch {}
        showToast({
          title: 'Access Restricted',
          message: 'Company accounts cannot access Student or Institution views.',
          type: 'warning'
        });
        return;
      }
    }

    setActivePage(targetPage);
    if (targetPage === 'industry-portal' && optionalTab) {
      setCompanyTab(optionalTab);
    }
    if (targetPage === 'settings') {
      setSettingsTab(optionalTab || null);
    }
    const targetPath = pageToPath(targetPage, normRole, optionalTab);
    try {
      window.history.pushState({ page: targetPage, tab: optionalTab }, '', targetPath);
    } catch {}
  }, [user, showToast]);

  // Handle Browser Back / Forward Button Navigation
  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolvePath(window.location.pathname, user);
      if (resolved.redirectReason === 'cross-role') {
        const fallbackPath = pageToPath(resolved.page, user?.role);
        try { window.history.replaceState(null, '', fallbackPath); } catch {}
        setActivePage(resolved.page);
        showToast({
          title: 'Access Restricted',
          message: 'You do not have permission to access that area.',
          type: 'warning'
        });
      } else if (resolved.redirectReason === 'unauthenticated') {
        try { window.history.replaceState(null, '', '/auth/select-role'); } catch {}
        setActivePage('role-select');
        showToast({
          title: 'Authentication Required',
          message: 'Please sign in to continue.',
          type: 'warning'
        });
      } else {
        setActivePage(resolved.page);
        if (resolved.companyTab) {
          setCompanyTab(resolved.companyTab);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, showToast]);

  // Handle Sector Card Selection
  const handleRoleSelect = (roleId) => {
    if (roleId === 'student') navigateGuarded('student-login');
    else if (roleId === 'institution') navigateGuarded('institution-login');
    else if (roleId === 'industry' || roleId === 'company') navigateGuarded('industry-login');
  };

  // Handle Successful Login across all 3 sectors
  const handleLoginSuccess = (loggedInUser) => {
    const normalizedUser = {
      ...loggedInUser,
      role: normalizeRole(loggedInUser.role),
      currentRole: normalizeRole(loggedInUser.role),
      userId: loggedInUser.userId || loggedInUser.id || (normalizeRole(loggedInUser.role) === 'institution' ? 'INS001' : normalizeRole(loggedInUser.role) === 'company' ? 'COM001' : 'STU001'),
      currentUserId: loggedInUser.currentUserId || loggedInUser.userId || loggedInUser.id || (normalizeRole(loggedInUser.role) === 'institution' ? 'INS001' : normalizeRole(loggedInUser.role) === 'company' ? 'COM001' : 'STU001')
    };

    try {
      localStorage.setItem('nexus_auth_user', JSON.stringify(normalizedUser));
    } catch (err) {
      console.error('Error saving session:', err);
    }
    setUser(normalizedUser);

    const normRole = normalizedUser.role;
    const targetPage = normRole === 'institution' ? 'institution-console' : normRole === 'company' ? 'industry-portal' : 'home';
    const targetPath = pageToPath(targetPage, normRole);

    setActivePage(targetPage);
    if (normRole === 'company') setCompanyTab('dashboard');
    try {
      window.history.pushState({ page: targetPage }, '', targetPath);
    } catch {}

    showToast({
      title: 'Signed in successfully.',
      message: `Welcome back to SkillNexus AI, ${normalizedUser.name || 'User'}!`,
      type: 'success'
    });
  };

  // Dedicated OTP Page & Forgot Password State
  const [otpParams, setOtpParams] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nexus_otp_params');
      return saved ? JSON.parse(saved) : { email: '', role: 'student', purpose: 'ACCOUNT_VERIFICATION', demoOtp: '' };
    } catch {
      return { email: '', role: 'student', purpose: 'ACCOUNT_VERIFICATION', demoOtp: '' };
    }
  });
  const [forgotRole, setForgotRole] = useState('student');

  const handleNavigateToOtp = useCallback((params) => {
    if (params) {
      setOtpParams(params);
      try { sessionStorage.setItem('nexus_otp_params', JSON.stringify(params)); } catch {}
    }
    setActivePage('verify-otp');
    try { window.history.pushState({ page: 'verify-otp' }, '', '/auth/verify-otp'); } catch {}
  }, []);

  const handleNavigateToForgot = useCallback((role = 'student') => {
    setForgotRole(role);
    setActivePage('forgot-password');
    try { window.history.pushState({ page: 'forgot-password' }, '', '/auth/forgot-password'); } catch {}
  }, []);

  // Check if current view is a full-screen unauthenticated/login view
  const isAuthPage = ['role-select', 'student-login', 'industry-login', 'institution-login', 'activate', 'verify-otp', 'forgot-password'].includes(activePage);

  if (isCheckingSession) {
    return (
      <div className="nexus-root" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#070b14',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase' }}>
            Verifying Session Integrity...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nexus-root">

      {/* Ambient Cyber Light Effects */}
      <div className="cyber-bg-glow"></div>
      <div className="cyber-grid-overlay"></div>

      {isAuthPage ? (
        <main style={{ position: 'relative', zIndex: 10, flex: 1, overflowY: 'auto', height: '100%' }}>
          {activePage === 'role-select' && (
            <RoleGateway onSelectRole={handleRoleSelect} />
          )}
          {activePage === 'student-login' && (
            <StudentLogin 
              onLoginSuccess={handleLoginSuccess}
              onBackToRoles={() => navigateGuarded('role-select')} 
              onNavigateToOtp={handleNavigateToOtp}
              onNavigateToForgot={() => handleNavigateToForgot('student')}
            />
          )}
          {activePage === 'institution-login' && (
            <InstitutionLogin 
              onLoginSuccess={handleLoginSuccess}
              onBackToRoles={() => navigateGuarded('role-select')} 
              onNavigateToOtp={handleNavigateToOtp}
              onNavigateToForgot={() => handleNavigateToForgot('institution')}
            />
          )}
          {activePage === 'industry-login' && (
            <IndustryLogin 
              onLoginSuccess={handleLoginSuccess}
              onBackToRoles={() => navigateGuarded('role-select')} 
              onNavigateToOtp={handleNavigateToOtp}
              onNavigateToForgot={() => handleNavigateToForgot('company')}
            />
          )}
          {activePage === 'activate' && (
            <StudentActivation />
          )}
          {activePage === 'verify-otp' && (
            <OtpVerificationPage
              email={otpParams.email}
              role={otpParams.role}
              purpose={otpParams.purpose}
              initialOtp={otpParams.demoOtp}
              onNavigate={(targetPage, params) => {
                if (params) {
                  setOtpParams(params);
                  try { sessionStorage.setItem('nexus_otp_params', JSON.stringify(params)); } catch {}
                }
                navigateGuarded(targetPage);
              }}
            />
          )}
          {activePage === 'forgot-password' && (
            <ForgotPasswordPage
              role={forgotRole}
              onNavigate={navigateGuarded}
              onOtpSent={handleNavigateToOtp}
            />
          )}
        </main>
      ) : (
        <div className="app-layout">
          {/* Left Cyber Sidebar */}
          <Sidebar 
            activePage={activePage} 
            setActivePage={navigateGuarded} 
            user={user} 
            onLogout={handleLogout}
            companyTab={companyTab}
          />

          {/* Main Content Area */}
          <div className="main-content-wrapper">
            {/* Top Navigation Bar */}
            <Navbar 
              onOpenAIModal={() => setIsAIModalOpen(true)}
              activePage={activePage}
              setActivePage={navigateGuarded}
              user={user}
              onLogout={handleLogout}
            />

            {/* Viewport Render matching role dashboards */}
            <main className="main-viewport" style={activePage === 'home' || activePage === 'industry-portal' ? { padding: 0, maxWidth: 'none' } : {}}>
              {/* Student Workspace */}
              {activePage === 'home' && normalizeRole(user?.role) === 'student' && (
                <StudentDashboard setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'college' && (
                <StudentCollegePage setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'skills' && (
                <MySkills setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'assessment' && (
                <SkillAssessment setActivePage={navigateGuarded} onShowToast={showToast} />
              )}
              {activePage === 'learning' && (
                <MyLearning setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'learning-progress' && (
                <LearningProgressAnalytics setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'advanced-tech' && (
                <AdvancedTech setActivePage={navigateGuarded} />
              )}
              {activePage === 'advanced-tech-deepdive' && (
                <TechDeepDive setActivePage={navigateGuarded} />
              )}
              {activePage === 'enroll' && (
                <CourseEnrollment setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'projects' && (
                <MyProjects onShowToast={showToast} user={user} />
              )}
              {activePage === 'opportunities' && normalizeRole(user?.role) === 'student' && (
                <Opportunities onShowToast={showToast} onOpenAIModal={() => setIsAIModalOpen(true)} user={user} />
              )}
              {activePage === 'passport' && (
                <DigitalPassport onShowToast={showToast} user={user} />
              )}
              {activePage === 'profile' && (
                <MyProfile setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'settings' && (
                <Settings setActivePage={navigateGuarded} onShowToast={showToast} user={user} initialTab={settingsTab} />
              )}
              {activePage === 'help' && (
                <HelpCenter onShowToast={showToast} user={user} />
              )}
              {activePage === 'notifications' && (
                <Notifications setActivePage={navigateGuarded} onShowToast={showToast} user={user} />
              )}
              {activePage === 'search' && (
                <SearchResults setActivePage={navigateGuarded} />
              )}

              {/* Institution Workspace */}
              {activePage.startsWith('institution-') && (
                <InstitutionConsole 
                  setActivePage={navigateGuarded}
                  activePage={activePage}
                  user={user} 
                  onShowToast={showToast} 
                  onLogout={handleLogout}
                />
              )}

              {/* Industry / Company Workspace */}
              {activePage === 'industry-portal' && (
                <IndustryPortal 
                  setActivePage={navigateGuarded} 
                  onShowToast={showToast} 
                  onLogout={handleLogout}
                  user={user}
                  initialTab={companyTab}
                  isEmbedded={true}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Interactive "Ask Nexus AI" Companion Drawer */}
      <NexusAIModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        setActivePage={navigateGuarded}
      />

      {/* High-Tech Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
