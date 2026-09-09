/**
 * SKILL NEXUS AI — Academic & Institutional Roster API Service
 * Handles Institution Onboarding Setup, Department Configuration,
 * CSV Template Download, Tabular Previews, Transactional Imports,
 * Manual Student Additions, and Account Lifecycle Management.
 */

const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const academicService = {
  // ── ONBOARDING SETUP ──
  async getSetupStatus() {
    const res = await fetch(`${API_BASE}/academic/setup/status`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async updateInstitutionSetup(setupData) {
    const res = await fetch(`${API_BASE}/academic/setup/institution`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(setupData)
    });
    return await res.json();
  },

  // ── DEPARTMENTS ──
  async getDepartments() {
    const res = await fetch(`${API_BASE}/academic/departments`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async createDepartment(code, name) {
    const res = await fetch(`${API_BASE}/academic/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ code, name })
    });
    return await res.json();
  },

  // ── CSV TEMPLATE & PREVIEW ──
  async downloadTemplate() {
    const res = await fetch(`${API_BASE}/academic/template/download`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to download template');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SkillNexus_Student_Roster_Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async previewRoster(csvContent, fileName = 'roster.csv') {
    const res = await fetch(`${API_BASE}/academic/roster/preview`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ csvContent, fileName })
    });
    return await res.json();
  },

  async confirmRosterImport(validRows, fileName = 'roster.csv') {
    const res = await fetch(`${API_BASE}/academic/roster/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ validRows, fileName })
    });
    return await res.json();
  },

  // ── MANUAL STUDENT CREATION ──
  async createManualStudent(studentData) {
    const res = await fetch(`${API_BASE}/academic/students/manual`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(studentData)
    });
    return await res.json();
  },

  // ── LIFECYCLE & INVITATIONS ──
  async resendStudentInvite(studentId) {
    const res = await fetch(`${API_BASE}/academic/students/${encodeURIComponent(studentId)}/resend-invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async updateStudentStatus(studentId, status) {
    const res = await fetch(`${API_BASE}/academic/students/${encodeURIComponent(studentId)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async getRosterImports() {
    const res = await fetch(`${API_BASE}/academic/roster/imports`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  // ── STUDENT ROSTER & DASHBOARD METRICS ──
  async getStudents() {
    const res = await fetch(`${API_BASE}/academic/students`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async getStudentById(id) {
    const res = await fetch(`${API_BASE}/academic/students/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async getDashboard() {
    const res = await fetch(`${API_BASE}/academic/dashboard`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/academic/analytics`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async getReadiness() {
    const res = await fetch(`${API_BASE}/academic/readiness`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async getSkillAnalytics() {
    const res = await fetch(`${API_BASE}/academic/skill-analytics`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  // ── COMPANY ACCESS REQUESTS & SHARING ──
  async getIndustryRequests() {
    const res = await fetch(`${API_BASE}/academic/industry-requests`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async requestCompanyAccess(companyData) {
    const res = await fetch(`${API_BASE}/academic/industry-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(companyData)
    });
    return await res.json();
  },

  async revokeCompanyAccess(requestId) {
    const res = await fetch(`${API_BASE}/academic/industry-requests/${encodeURIComponent(requestId)}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  // ── PUBLIC STUDENT ACTIVATION ──
  async verifyInvitation(token) {
    const res = await fetch(`${API_BASE}/auth/invitation/${encodeURIComponent(token)}`);
    return await res.json();
  },

  async activateAccount(token, password) {
    const res = await fetch(`${API_BASE}/auth/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password })
    });
    return await res.json();
  },

  // ── COURSE CERTIFICATES VERIFICATION ──
  async getCourseCertificates() {
    const res = await fetch(`${API_BASE}/academic/course-certificates`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async verifyCourseCertificate(id, notes) {
    const res = await fetch(`${API_BASE}/academic/course-certificates/${encodeURIComponent(id)}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ notes })
    });
    return await res.json();
  },

  async rejectCourseCertificate(id, notes) {
    const res = await fetch(`${API_BASE}/academic/course-certificates/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ notes })
    });
    return await res.json();
  },

  // ── INSTITUTION SKILLS & COURSES ──
  async getSkills(filterStatus = '') {
    const url = filterStatus 
      ? `${API_BASE}/academic/skills?status=${encodeURIComponent(filterStatus)}`
      : `${API_BASE}/academic/skills`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async getSkill(skillId) {
    const res = await fetch(`${API_BASE}/academic/skills/${encodeURIComponent(skillId)}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async saveSkill(skillData, isPublish = false) {
    const res = await fetch(`${API_BASE}/academic/skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ ...skillData, isPublish })
    });
    return await res.json();
  },

  async archiveSkill(skillId) {
    const res = await fetch(`${API_BASE}/academic/skills/${encodeURIComponent(skillId)}/archive`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  // ── ENROLLMENT REQUESTS APPROVAL ──
  async getPendingEnrollmentRequests() {
    const res = await fetch(`${API_BASE}/academic/enrollment-requests`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  async approveEnrollment(enrollmentId, reason = '') {
    const res = await fetch(`${API_BASE}/academic/enrollments/${encodeURIComponent(enrollmentId)}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ reason })
    });
    return await res.json();
  },

  async rejectEnrollment(enrollmentId, reason = '') {
    const res = await fetch(`${API_BASE}/academic/enrollments/${encodeURIComponent(enrollmentId)}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ reason })
    });
    return await res.json();
  }
};
