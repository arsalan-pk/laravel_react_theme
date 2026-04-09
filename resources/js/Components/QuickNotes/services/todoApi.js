import axios from 'axios';
import { API_ENDPOINTS } from '../constants';
import { formUtils, errorUtils } from '../utils';

/**
 * Todo API Service - Centralized API calls with error handling
 */
class TodoApiService {
    /**
     * Get all days with todo statistics
     */
    async getDays() {
        try {
            const response = await axios.get(API_ENDPOINTS.DAYS);
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API getDays', error);
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to load days') 
            };
        }
    }

    /**
     * Get todos for a specific day
     */
    async getNotesByDay(date) {
        try {
            const response = await axios.get(API_ENDPOINTS.BY_DAY, {
                params: { date }
            });
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API getNotesByDay', error, { date });
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to load notes for this day') 
            };
        }
    }

    /**
     * Create a new todo
     */
    async createNote(noteText, audioFile = null) {
        try {
            const formData = formUtils.createNoteFormData(noteText, audioFile);
            const headers = formUtils.getMultipartHeaders();
            
            const response = await axios.post(API_ENDPOINTS.STORE, formData, { headers });
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API createNote', error, { noteText, hasAudio: !!audioFile });
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to save todo') 
            };
        }
    }

    /**
     * Update an existing todo
     */
    async updateNote(id, noteText, audioFile = null) {
        try {
            const formData = formUtils.createNoteFormData(noteText, audioFile);
            const headers = formUtils.getMultipartHeaders('PUT');
            
            const response = await axios.post(API_ENDPOINTS.UPDATE(id), formData, { headers });
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API updateNote', error, { id, noteText, hasAudio: !!audioFile });
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to update todo') 
            };
        }
    }

    /**
     * Toggle todo completion status
     */
    async toggleComplete(id) {
        try {
            const response = await axios.patch(API_ENDPOINTS.TOGGLE_COMPLETE(id));
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API toggleComplete', error, { id });
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to update todo status') 
            };
        }
    }

    /**
     * Soft delete a todo
     */
    async deleteNote(id) {
        try {
            const response = await axios.delete(API_ENDPOINTS.DELETE(id));
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API deleteNote', error, { id });
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to delete todo') 
            };
        }
    }

    /**
     * Get trashed todos
     */
    async getTrashedNotes() {
        try {
            const response = await axios.get(API_ENDPOINTS.TRASHED);
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API getTrashedNotes', error);
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to load trashed notes') 
            };
        }
    }

    /**
     * Restore a todo from trash
     */
    async restoreNote(id) {
        try {
            const response = await axios.post(API_ENDPOINTS.RESTORE(id));
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API restoreNote', error, { id });
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to restore todo') 
            };
        }
    }

    /**
     * Permanently delete a todo
     */
    async forceDeleteNote(id) {
        try {
            const response = await axios.delete(API_ENDPOINTS.FORCE_DELETE(id));
            return { success: true, data: response.data };
        } catch (error) {
            errorUtils.logError('API forceDeleteNote', error, { id });
            return { 
                success: false, 
                error: errorUtils.getErrorMessage(error, 'Failed to permanently delete todo') 
            };
        }
    }
}

// Export singleton instance
export const todoApi = new TodoApiService();
