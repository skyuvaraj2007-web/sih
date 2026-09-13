/**
 * SKILL NEXUS AI — Real Database-Driven Message & Conversation Service
 * Connects directly to backend /api/messages backed by PostgreSQL.
 * Strict relationship and participant authentication.
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

export const messageService = {
  /**
   * Get all active conversations for the authenticated user.
   */
  async getConversations() {
    try {
      const res = await fetch(`${API_BASE}/messages/conversations`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`Failed to load conversations (${res.status})`);
      }
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.warn('[messageService.getConversations] note:', err.message);
      return [];
    }
  },

  /**
   * Get messages for a specific conversation.
   */
  async getMessages(conversationId) {
    try {
      const res = await fetch(`${API_BASE}/messages/conversations/${encodeURIComponent(conversationId)}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`Failed to load messages (${res.status})`);
      }
      const json = await res.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.warn('[messageService.getMessages] note:', err.message);
      return [];
    }
  },

  /**
   * Send a message to an existing conversation.
   */
  async sendMessage(conversationId, text) {
    const res = await fetch(`${API_BASE}/messages/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to send message (${res.status})`);
    }
    return await res.json();
  },

  /**
   * Start a new conversation with a recipient user.
   */
  async createConversation(recipientUserId, initialMessage = null, title = null, opportunityId = null) {
    const res = await fetch(`${API_BASE}/messages/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        recipientUserId,
        title,
        opportunityId,
        initialMessage
      })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to create conversation (${res.status})`);
    }
    return await res.json();
  }
};
