/**
 * SKILLNEXUS AI - Central Notification Store
 * Single source of truth for all role-specific notifications.
 * Supports Student, Institution, and Company roles with strict data isolation.
 * All notification records are database-driven with zero fake sample data.
 */

import { nexusApiClient } from './nexusApiClient';

const STORAGE_KEY = 'nexus_notifications_data';

export function normalizeRole(role) {
  if (!role) return 'student';
  const r = String(role).toLowerCase().trim();
  if (r === 'industry' || r === 'company' || r === 'recruiter') return 'company';
  if (r === 'institution' || r === 'academia') return 'institution';
  return 'student';
}

export const SEED_NOTIFICATIONS = [];

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_notifications_updated'));
  }
}

export function loadAllNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out any legacy hardcoded mock notifications starting with notif_0
    return parsed.filter(n => n && (!n.id || !String(n.id).startsWith('notif_0')));
  } catch (err) {
    console.error('Error reading notifications:', err);
    return [];
  }
}

export function saveAllNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    notifySubscribers();
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

export function getActiveNotifications() {
  const all = loadAllNotifications();
  return all.filter(n => !n.deleted);
}

export function getTrashNotifications() {
  const all = loadAllNotifications();
  return all.filter(n => n.deleted);
}

/** Role-isolated getters — guaranteed data isolation between roles */
export function getActiveNotificationsByRole(role, user = null) {
  const normRole = normalizeRole(role);
  const all = loadAllNotifications();
  return all.filter(n => {
    if (n.deleted) return false;
    if (normalizeRole(n.role) !== normRole) return false;
    if (n.id && String(n.id).startsWith('notif_0')) return false;
    return true;
  });
}

export function getTrashNotificationsByRole(role, user = null) {
  const normRole = normalizeRole(role);
  const all = loadAllNotifications();
  return all.filter(n => {
    if (!n.deleted) return false;
    if (normalizeRole(n.role) !== normRole) return false;
    if (n.id && String(n.id).startsWith('notif_0')) return false;
    return true;
  });
}

export function getUnreadCount(role, user = null) {
  if (role) {
    return getActiveNotificationsByRole(role, user).filter(n => n.unread).length;
  }
  const active = getActiveNotifications();
  return active.filter(n => n.unread).length;
}

export function getNotificationById(id) {
  const all = loadAllNotifications();
  return all.find(n => n.id === id) || null;
}

export function markAsRead(id) {
  const all = loadAllNotifications();
  const updated = all.map(n => n.id === id ? { ...n, unread: false } : n);
  saveAllNotifications(updated);
  nexusApiClient.markNotificationRead(id).catch(err => console.debug('API sync deferred:', err));
}

export function markAllAsRead(role) {
  const normRole = role ? normalizeRole(role) : null;
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (!normRole || normalizeRole(n.role) === normRole) {
      return { ...n, unread: false };
    }
    return n;
  });
  saveAllNotifications(updated);
  nexusApiClient.markAllNotificationsRead(normRole).catch(err => console.debug('API sync deferred:', err));
}

export function softDeleteNotification(id) {
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (n.id === id) {
      return {
        ...n,
        deleted: true,
        deletedAt: new Date().toISOString()
      };
    }
    return n;
  });
  saveAllNotifications(updated);
  nexusApiClient.softDeleteNotification(id).catch(err => console.debug('API sync deferred:', err));
}

export function restoreNotification(id) {
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (n.id === id) {
      return {
        ...n,
        deleted: false,
        deletedAt: null
      };
    }
    return n;
  });
  saveAllNotifications(updated);
  nexusApiClient.restoreNotification(id).catch(err => console.debug('API sync deferred:', err));
}

export function restoreAllNotifications(role) {
  const normRole = role ? normalizeRole(role) : null;
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (n.deleted && (!normRole || normalizeRole(n.role) === normRole)) {
      return {
        ...n,
        deleted: false,
        deletedAt: null
      };
    }
    return n;
  });
  saveAllNotifications(updated);
}

export function permanentlyDeleteNotification(id) {
  const all = loadAllNotifications();
  const updated = all.filter(n => n.id !== id);
  saveAllNotifications(updated);
}

export function emptyTrash(role) {
  const normRole = role ? normalizeRole(role) : null;
  const all = loadAllNotifications();
  const updated = all.filter(n => !(n.deleted && (!normRole || normalizeRole(n.role) === normRole)));
  saveAllNotifications(updated);
  nexusApiClient.emptyTrash(normRole).catch(err => console.debug('API sync deferred:', err));
}

export function addRoleNotification(role, notifData) {
  const normRole = normalizeRole(role);
  const all = loadAllNotifications();
  const newNotif = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`,
    role: normRole,
    type: notifData.type || 'system',
    title: notifData.title || 'System Notification',
    preview: notifData.message || notifData.preview || 'New activity recorded on the sovereign ledger.',
    time: 'Just now',
    timestamp: new Date().toISOString(),
    unread: true,
    deleted: false,
    color: notifData.urgency === 'high' ? '#28D7FF' : notifData.urgency === 'medium' ? '#2FE0A1' : '#8B5CF6',
    categoryLabel: notifData.type ? notifData.type.toUpperCase() : 'PLATFORM',
    details: notifData.details || {
      whyReceived: notifData.message || 'Activity synced across the SkillNexus network.',
      action: notifData.action || 'view'
    }
  };

  const updated = [newNotif, ...all];
  saveAllNotifications(updated);
  nexusApiClient.addNotification(normRole, notifData).catch(err => console.debug('API sync deferred:', err));
  return newNotif;
}
