// Quick Todo List Constants
export const SPEECH_RECOGNITION_CONFIG = {
    LANGUAGE: 'en-US', // English (United States)
    CONTINUOUS: true,
    INTERIM_RESULTS: true,
};

export const AUDIO_CONFIG = {
    MAX_FILE_SIZE: 10240, // 10MB in KB
    SUPPORTED_FORMATS: ['wav', 'mp3', 'm4a', 'ogg', 'webm'],
    PREFERRED_MIME_TYPES: [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4'
    ],
};

export const UI_CONFIG = {
    DRAWER_WIDTH: 600,
    MIN_TEXT_ROWS: 3,
    MAX_TEXT_ROWS: 6,
    SCROLL_DELAY: 100,
    ANIMATION_DURATION: 200,
};

export const API_ENDPOINTS = {
    DAYS: '/api/todolist/days',
    BY_DAY: '/api/todolist/by-day',
    STORE: '/api/todolist',
    UPDATE: (id) => `/api/todolist/${id}`,
    DELETE: (id) => `/api/todolist/${id}`,
    TRASHED: '/api/todolist/trashed',
    RESTORE: (id) => `/api/todolist/${id}/restore`,
    FORCE_DELETE: (id) => `/api/todolist/${id}/force`,
    TOGGLE_COMPLETE: (id) => `/api/todolist/${id}/toggle-complete`,
};

export const MESSAGES = {
    ERRORS: {
        MICROPHONE_ACCESS: 'Could not access microphone',
        SPEECH_RECOGNITION: 'Speech recognition failed. Voice will still be recorded.',
        SPEECH_UNAVAILABLE: 'Speech recognition unavailable. Voice will still be recorded.',
        UPLOAD_FAILED: 'Failed to send voice note',
        UPDATE_FAILED: 'Failed to update todo status',
        DELETE_FAILED: 'Failed to delete note',
        RESTORE_FAILED: 'Failed to restore note',
        LOAD_FAILED: 'Failed to load notes',
    },
    SUCCESS: {
        NOTE_SAVED: 'Todo saved successfully',
        NOTE_UPDATED: 'Todo updated successfully',
        NOTE_DELETED: 'Todo deleted successfully',
        NOTE_RESTORED: 'Todo restored successfully',
    },
    RECORDING: {
        AUDIO: '🎤 Recording Audio... Click Stop when done',
        TRANSCRIBING: '🗣️ Converting speech to text...',
        READY: '🎵 Voice note ready - Play to preview or Send',
    },
};

export const COLORS = {
    SUCCESS: '#10b981',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
    COMPLETED_BG: '#f0f9ff',
    COMPLETED_BORDER: '#10b981',
    AUDIO_BG: '#f0f9ff',
    AUDIO_BORDER: '#0ea5e9',
    DELETED_AUDIO_BG: '#fff3e0',
    DELETED_AUDIO_BORDER: '#ff9800',
};
