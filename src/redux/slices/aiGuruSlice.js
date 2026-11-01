import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  sendAiGuruMessageApi,
  getAiGuruSessionsApi,
  getAiGuruSessionApi,
  deleteAiGuruSessionApi,
  clearAiGuruHistoryApi,
  sendAiGuruFeedbackApi,
} from '../../api/aiGuruApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message ||
  (error.code === 'ECONNABORTED'
    ? 'AI Guru is taking too long. Please try again.'
    : error.message) ||
  fallback;

/*
|--------------------------------------------------------------------------
| THUNKS
|--------------------------------------------------------------------------
*/

/*
 * Sends one question. The current chat, farm and language come from the
 * store; `fieldId` / `source` can be passed to override them (e.g. when a
 * farm screen opens AI Guru for that farm).
 *
 * arg: { message, image?: { base64, mimeType }, imageUri?, source?, fieldId? }
 */
export const sendAiGuruMessage = createAsyncThunk(
  'aiGuru/send',
  async (
    { message, image, source = 'aiguru', fieldId },
    { getState, rejectWithValue },
  ) => {
    const { sessionId, activeFieldId, language } = getState().aiGuru;

    try {
      return await sendAiGuruMessageApi({
        message,
        sessionId: sessionId || undefined,
        fieldId: (fieldId !== undefined ? fieldId : activeFieldId) || 'general',
        language,
        source,
        ...(image ? { image } : {}),
      });
    } catch (error) {
      return rejectWithValue({
        message: errorMessage(error, 'Unable to reach AI Guru'),
        status: error.response?.status || null,
      });
    }
  },
);

export const fetchAiGuruSessions = createAsyncThunk(
  'aiGuru/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      return await getAiGuruSessionsApi({ limit: 30 });
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load chats'));
    }
  },
);

export const openAiGuruSession = createAsyncThunk(
  'aiGuru/openSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await getAiGuruSessionApi(sessionId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to open chat'));
    }
  },
);

export const deleteAiGuruSession = createAsyncThunk(
  'aiGuru/deleteSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await deleteAiGuruSessionApi(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to delete chat'));
    }
  },
);

export const clearAiGuruHistory = createAsyncThunk(
  'aiGuru/clearHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await clearAiGuruHistoryApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to clear history'));
    }
  },
);

export const rateAiGuruMessage = createAsyncThunk(
  'aiGuru/rate',
  async ({ messageId, rating }, { rejectWithValue }) => {
    try {
      await sendAiGuruFeedbackApi(messageId, rating);
      return { messageId, rating };
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to save feedback'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const initialState = {
  sessionId: null,
  messages: [],

  // null = general farming mode
  activeFieldId: null,
  language: 'en',

  sending: false,
  loadingSession: false,

  sessions: [],
  sessionsLoading: false,

  remainingToday: null,
  error: null,
};

const findMessage = (state, id) =>
  state.messages.find(message => message.id === id);

const aiGuruSlice = createSlice({
  name: 'aiGuru',
  initialState,

  reducers: {
    startNewAiGuruChat: state => {
      state.sessionId = null;
      state.messages = [];
      state.error = null;
    },

    setAiGuruFarm: (state, action) => {
      state.activeFieldId = action.payload || null;
    },

    setAiGuruLanguage: (state, action) => {
      state.language = action.payload || 'en';
    },

    resetAiGuru: () => initialState,
  },

  extraReducers: builder => {
    builder
      // SEND
      .addCase(sendAiGuruMessage.pending, (state, action) => {
        const { message, imageUri } = action.meta.arg;

        state.sending = true;
        state.error = null;
        state.messages.push({
          id: `local-${action.meta.requestId}`,
          role: 'user',
          text: message || '',
          hasImage: Boolean(imageUri),
          imageUri: imageUri || null,
          actions: [],
          pending: true,
          createdAt: new Date().toISOString(),
        });
      })
      .addCase(sendAiGuruMessage.fulfilled, (state, action) => {
        const { session, userMessage, reply, remainingToday } = action.payload;
        const local = findMessage(state, `local-${action.meta.requestId}`);

        if (local) {
          Object.assign(local, userMessage, {
            imageUri: local.imageUri,
            pending: false,
          });
        }

        state.messages.push(reply);
        state.sessionId = session.id;
        state.remainingToday = remainingToday;
        state.sending = false;

        // keep the history list fresh without another request
        state.sessions = [
          session,
          ...state.sessions.filter(item => item.id !== session.id),
        ];
      })
      .addCase(sendAiGuruMessage.rejected, (state, action) => {
        const local = findMessage(state, `local-${action.meta.requestId}`);
        const error = action.payload?.message || 'Unable to reach AI Guru';

        if (local) {
          local.pending = false;
          local.failed = true;
        }

        state.messages.push({
          id: `error-${action.meta.requestId}`,
          role: 'assistant',
          text: error,
          actions: [],
          isError: true,
          localOnly: true,
          createdAt: new Date().toISOString(),
        });
        state.sending = false;
        state.error = error;
      })

      // HISTORY LIST
      .addCase(fetchAiGuruSessions.pending, state => {
        state.sessionsLoading = true;
      })
      .addCase(fetchAiGuruSessions.fulfilled, (state, action) => {
        state.sessions = action.payload.sessions || [];
        state.sessionsLoading = false;
      })
      .addCase(fetchAiGuruSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.error = action.payload;
      })

      // OPEN A PAST CHAT
      .addCase(openAiGuruSession.pending, state => {
        state.loadingSession = true;
        state.error = null;
      })
      .addCase(openAiGuruSession.fulfilled, (state, action) => {
        const { session, messages } = action.payload;

        state.sessionId = session.id;
        state.messages = messages || [];
        state.activeFieldId = session.farmField || null;
        state.loadingSession = false;
      })
      .addCase(openAiGuruSession.rejected, (state, action) => {
        state.loadingSession = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteAiGuruSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(
          item => item.id !== action.payload,
        );

        if (state.sessionId === action.payload) {
          state.sessionId = null;
          state.messages = [];
        }
      })
      .addCase(clearAiGuruHistory.fulfilled, state => {
        state.sessions = [];
        state.sessionId = null;
        state.messages = [];
      })

      // FEEDBACK (optimistic)
      .addCase(rateAiGuruMessage.pending, (state, action) => {
        const message = findMessage(state, action.meta.arg.messageId);
        if (message) {
          message.previousFeedback = message.feedback || null;
          message.feedback = action.meta.arg.rating;
        }
      })
      .addCase(rateAiGuruMessage.rejected, (state, action) => {
        const message = findMessage(state, action.meta.arg.messageId);
        if (message) message.feedback = message.previousFeedback || null;
      })

      // a different user may log in next
      .addMatcher(
        action =>
          action.type === 'auth/logout/fulfilled' ||
          action.type === 'auth/logout/rejected' ||
          action.type === 'auth/clearAuthState',
        () => initialState,
      );
  },
});

export const {
  startNewAiGuruChat,
  setAiGuruFarm,
  setAiGuruLanguage,
  resetAiGuru,
} = aiGuruSlice.actions;

export const selectAiGuru = state => state.aiGuru;

export default aiGuruSlice.reducer;
