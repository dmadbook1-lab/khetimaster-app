import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| AI GURU API
|--------------------------------------------------------------------------
|
| POST   /api/ai-guru/chat
| GET    /api/ai-guru/usage
| GET    /api/ai-guru/sessions
| DELETE /api/ai-guru/sessions
| GET    /api/ai-guru/sessions/:sessionId
| PATCH  /api/ai-guru/sessions/:sessionId
| DELETE /api/ai-guru/sessions/:sessionId
| POST   /api/ai-guru/messages/:messageId/feedback
|
*/

// The assistant may look up farms, weather and prices before replying
const CHAT_TIMEOUT_MS = 90000;

/**
 * @param {object} payload
 * @param {string} payload.message
 * @param {string} [payload.sessionId]  Omit to start a new chat
 * @param {string|null} [payload.fieldId]  Farm id, or 'general'
 * @param {string} [payload.language]
 * @param {string} [payload.source]  aiguru | voice | farm | disease | mandi | community
 * @param {{ base64: string, mimeType: string }} [payload.image]
 */
export const sendAiGuruMessageApi = async payload => {
  const response = await apiClient.post(API_ENDPOINTS.AI_GURU_CHAT, payload, {
    timeout: CHAT_TIMEOUT_MS,
  });

  return response.data;
};

export const getAiGuruUsageApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.AI_GURU_USAGE);

  return response.data;
};

export const getAiGuruSessionsApi = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.AI_GURU_SESSIONS, {
    params: { page, limit },
  });

  return response.data;
};

export const getAiGuruSessionApi = async sessionId => {
  const response = await apiClient.get(
    API_ENDPOINTS.AI_GURU_SESSION(sessionId),
  );

  return response.data;
};

export const updateAiGuruSessionApi = async (sessionId, changes) => {
  const response = await apiClient.patch(
    API_ENDPOINTS.AI_GURU_SESSION(sessionId),
    changes,
  );

  return response.data;
};

export const deleteAiGuruSessionApi = async sessionId => {
  const response = await apiClient.delete(
    API_ENDPOINTS.AI_GURU_SESSION(sessionId),
  );

  return response.data;
};

export const clearAiGuruHistoryApi = async () => {
  const response = await apiClient.delete(API_ENDPOINTS.AI_GURU_SESSIONS);

  return response.data;
};

/** rating: 'up' | 'down' | null (removes the rating) */
export const sendAiGuruFeedbackApi = async (messageId, rating) => {
  const response = await apiClient.post(
    API_ENDPOINTS.AI_GURU_FEEDBACK(messageId),
    { rating },
  );

  return response.data;
};
