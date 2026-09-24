import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowLeft,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Key,
  User,
  Phone,
  Sparkles,
  Eye,
  EyeOff,
  BookOpen,
  Award
} from 'lucide-react';
import { authService } from '../services/authService';
import SihDemoLoginSection, { SihDemoLoginBanner } from '../components/auth/SihDemoAccessBar';
import LoginRoleTabs from '../components/auth/LoginRoleTabs';

export default function AcademicianLogin({ onLoginSuccess, onBackToRoles, onNavigateToOtp, onNavigateToForgot, prefillCredentials, onSelectRole, onShowToast }) {
  const [email, setEmail] = useState(() => prefillCredentials?.email || '');
  const [password, setPassword] = useState(() => prefillCredentials?.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (prefillCredentials?.email) {
      setEmail(prefillCredentials.email);
      setPassword(prefillCredentials.password || '');
    }
  }, [prefillCredentials]);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regData, setRegData] = useState({
    name: '',
    facultyId: '',
    email: '',
    password: '',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    institutionId: '',
    phone: '',
    bio: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Registered institutions for picker
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    let isMounted = true;
    authService.getRegisteredInstitutions().then(insts => {
      if (isMounted && Array.isArray(insts)) setInstitutions(insts);
    });
    return () => { isMounted = false; };
  }, []);

  const [rememberMe, setRememberMe] = useState(true);

  // Quick Demo Account Auto-Fill
  const handleQuickDemoFill = () => {
    setEmail('arun@example.com');
    setPassword('Arun@123');
    setError('');
  };

  // Handle Login Submit via dedicated academician endpoint
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const result = await authService.academicianLogin(email.trim(), password.trim(), rememberMe);

      if (!result.success) {
        setError(result.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Academician authentication verified. Initializing Academician Dashboard...');
      setTimeout(() => {
        onLoginSuccess(result.user);
      }, 300);
    } catch (err) {
      setError('Unable to login right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!regData.name || !regData.email || !regData.password) {
      setRegError('Please complete all required fields.');
      return;
    }

    setRegLoading(true);
    setRegError('');

    try {
      const res = await fetch('/api/auth/register/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regData.name,
          fullName: regData.name,
          email: regData.email,
          password: regData.password,
          facultyId: regData.facultyId || `FAC-${Date.now().toString().slice(-6)}`,
          designation: regData.designation,
          department: regData.department,
          institutionId: regData.institutionId || (institutions[0]?.id || 'VTI-73698'),
          phone: regData.phone,
          bio: regData.bio
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      setShowRegisterModal(false);
      setSuccessMsg('Faculty account created! Please sign in with your credentials.');
      setEmail(regData.email);
      setPassword(regData.password);
    } catch (err) {
      setRegError(err.message || 'Error creating account.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '36px 16px 64px',
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.12) 0%, #070b14 70%)'
    }}>
      {/* Back Button */}
      <button
        onClick={onBackToRoles}
        style={{
          position: 'absolute',
          top: '28px',
          left: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e2e8f0',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <ArrowLeft size={16} /> Select Portal
      </button>

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15)',
        borderRadius: '20px',
        padding: '36px 32px'
      }}>
        {/* Header Badge & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 14px',
            borderRadius: '999px',
            color: '#818cf8',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '14px'
          }}>
            <GraduationCap size={15} /> ACADEMICIAN PORTAL
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Academician Login
          </h2>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0 }}>
            Mentor students, track skill progress, and view class cohort telemetry.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <LoginRoleTabs activeRole="academician" onSelectRole={onSelectRole} />

        {/* SIH DEMO ACCESS QUICK FILL */}
        <SihDemoLoginBanner role="academician" onFill={(em, pw) => { setEmail(em); setPassword(pw); setError(''); }} />

        {/* Feedback Messages */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#34d399',
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Institutional Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Institutional Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professor@institution.edu.in"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 14px 12px 42px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigateToForgot ? onNavigateToForgot('faculty') : setError('Please contact institution admin to reset credentials.')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 42px 12px 42px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '14px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
            <input
              type="checkbox"
              id="academician-remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#6366f1', width: '16px', height: '16px' }}
            />
            <label htmlFor="academician-remember-me" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
              Remember me on this sovereign node
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '13px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>Login</>
            )}
          </button>
        </form>

        {/* Links back to main role gateway & registration */}
        <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={onBackToRoles}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '12.5px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Back to Main Login & Role Selection
          </button>
        </div>

        {/* Footer: Register prompt */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>New academician or faculty member? </span>
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Register Profile
          </button>
        </div>
      </div>

      {/* SIH DEMO LOGIN 4-CARD SECTION */}
      <div style={{ width: '100%', maxWidth: '1080px', marginTop: '36px' }}>
        <SihDemoLoginSection
          onSelectDemo={(roleId, creds) => {
            if (roleId === 'academician' || roleId === 'faculty') {
              setEmail(creds.email);
              setPassword(creds.password);
              setError('');
              setSuccessMsg('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (onSelectRole) {
              onSelectRole(roleId, creds);
            }
          }}
          onShowToast={onShowToast}
        />
      </div>

      {/* Faculty Registration Modal */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: '#0f172a',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '28px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                  Register Academician Profile
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Create an institutional faculty account to mentor students.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {regError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="Dr. Rajesh Sharma"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Faculty ID / Roll Code</label>
                  <input
                    type="text"
                    value={regData.facultyId}
                    onChange={(e) => setRegData({ ...regData, facultyId: e.target.value })}
                    placeholder="FAC-2026-042"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Official Email *</label>
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="rajesh@institution.edu.in"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Password *</label>
                  <input
                    type="password"
                    required
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="••••••••••••"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Designation</label>
                  <select
                    value={regData.designation}
                    onChange={(e) => setRegData({ ...regData, designation: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department">Head of Department (HOD)</option>
                    <option value="Dean of Academics">Dean of Academics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Department</label>
                  <input
                    type="text"
                    value={regData.department}
                    onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>Affiliated Institution</label>
                <select
                  value={regData.institutionId}
                  onChange={(e) => setRegData({ ...regData, institutionId: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px' }}
                >
                  {institutions.map(inst => (
                    <option key={inst.id || inst.code} value={inst.id || inst.code}>
                      {inst.name || inst.collegeName} ({inst.code || inst.collegeCode || 'TN'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#cbd5e1', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  style={{ background: '#6366f1', border: 'none', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: regLoading ? 'not-allowed' : 'pointer' }}
                >
                  {regLoading ? 'Registering...' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
