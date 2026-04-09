import { AUDIO_CONFIG } from './constants';

/**
 * Audio utilities for voice recording and playback
 */
export const audioUtils = {
    /**
     * Get the best supported audio format for the current browser
     */
    getBestAudioFormat() {
        const { PREFERRED_MIME_TYPES } = AUDIO_CONFIG;

        for (const mimeType of PREFERRED_MIME_TYPES) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                return { mimeType };
            }
        }

        return { mimeType: 'audio/webm' }; // Fallback
    },

    /**
     * Get file extension from MIME type
     */
    getFileExtension(mimeType) {
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('wav')) return 'wav';
        return 'webm'; // Default
    },

    /**
     * Create a proper File object from blob
     */
    createAudioFile(blob, mimeType) {
        const extension = this.getFileExtension(mimeType);
        return new File([blob], `voice_note.${extension}`, {
            type: mimeType,
            lastModified: Date.now()
        });
    },

    /**
     * Check if browser supports speech recognition
     */
    supportsSpeechRecognition() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
};

/**
 * Date utilities for todo organization
 */
export const dateUtils = {
    /**
     * Get today's date in YYYY-MM-DD format
     */
    getToday() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Format date for display
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Check if date is today
     */
    isToday(date) {
        return date === this.getToday();
    }
};

/**
 * Form data utilities
 */
export const formUtils = {
    /**
     * Create FormData for note submission
     */
    createNoteFormData(noteText, audioFile) {
        const formData = new FormData();

        if (noteText?.trim()) {
            formData.append('note_text', noteText.trim());
        }

        if (audioFile) {
            formData.append('audio_file', audioFile);
        }

        return formData;
    },

    /**
     * Create headers for multipart requests
     */
    getMultipartHeaders(method = 'POST') {
        const headers = {
            'Content-Type': 'multipart/form-data',
        };

        if (method === 'PUT') {
            headers['X-HTTP-Method-Override'] = 'PUT';
        }

        return headers;
    }
};

/**
 * State management utilities
 */
export const stateUtils = {
    /**
     * Calculate completion statistics for a day
     */
    calculateDayStats(notes) {
        const completedCount = notes.filter(note => note.is_completed).length;
        const totalCount = notes.length;
        const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const isAllCompleted = completedCount === totalCount && totalCount > 0;

        return {
            completedCount,
            totalCount,
            completionPercentage,
            isAllCompleted
        };
    },

    /**
     * Update day statistics in days array
     */
    updateDayInList(days, targetDate, stats) {
        return days.map(day => {
            if (day.date === targetDate) {
                return {
                    ...day,
                    completed_count: stats.completedCount,
                    completion_percentage: stats.completionPercentage,
                    is_all_completed: stats.isAllCompleted,
                    note_count: stats.totalCount
                };
            }
            return day;
        });
    }
};

/**
 * Error handling utilities
 */
export const errorUtils = {
    /**
     * Get user-friendly error message
     */
    getErrorMessage(error, defaultMessage) {
        return error.response?.data?.message || defaultMessage;
    },

    /**
     * Log error with context
     */
    logError(context, error, additionalData = {}) {
        console.error(`[${context}] Error:`, error);
        if (Object.keys(additionalData).length > 0) {
            console.error(`[${context}] Additional data:`, additionalData);
        }
    }
};
