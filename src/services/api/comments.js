// src/services/api/comments.js
import ApiClient from './ApiClient';
import config from '../../config/api';

export const commentsAPI = {
    /**
     * Get all comments for a report
     */
    getComments: async (reportId) => {
        const response = await ApiClient.get(`/reports/${reportId}/comments`);
        return response.data;
    },

    /**
     * Add a new comment to a report
     */
    addComment: async (reportId, content) => {
        const response = await ApiClient.post('/comments', {
            report_id: reportId,
            content: content,
        });
        return response.data;
    },

    /**
     * Delete a comment
     */
    deleteComment: async (commentId) => {
        const response = await ApiClient.delete(`/comments/${commentId}`);
        return response.data;
    },
};

export default commentsAPI;
