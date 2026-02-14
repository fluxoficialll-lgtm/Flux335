
import { Post } from '../../../types';
import { API_BASE } from '../../../apiConfig';
import { db } from '../../../database';
import { PostUtils } from './PostUtils';
import { ContentDnaService } from '../../ai/core/ContentDnaService';
import { logService } from '../../logService';

const API_URL = `${API_BASE}/api/posts`;

export const PostActionService = {
    async uploadMedia(file: File, folder: string = 'feed'): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        const fileUrl = data.files[0].url;
        logService.logEvent('Cloudflare Mídia Adicionadas. ✅', { fileUrl, folder });
        return fileUrl;
    },

    async addPost(post: Post): Promise<void> {
        try {
            post.dna = await ContentDnaService.generateDna(post);

            const res = await fetch(`${API_URL}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.post) post = data.post;
            }
        } catch (e) {}
        
        const sanitizedPost = PostUtils.sanitizePost(post);
        db.posts.add(sanitizedPost);

        if (sanitizedPost.groupId) {
            logService.logEvent('PostgreSQL Group Post Metadados Adicionados. ✅', { postId: sanitizedPost.id, groupId: sanitizedPost.groupId });
        } else {
            logService.logEvent('PostgreSQL Feed Metadados Adicionados. ✅', { postId: sanitizedPost.id });
        }
    },

    async deletePost(id: string): Promise<void> {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Failed to delete post on server.' }));
                throw new Error(errorData.error || 'Server error during deletion');
            }
    
            const post = await db.posts.get(id);
            db.posts.delete(id);
    
            if (post) {
                if (post.type === 'video') {
                    logService.logEvent('PostgreSQL Reels Metadados Apagados. 🗑️', { postId: id });
                } else if (post.groupId) {
                    logService.logEvent('PostgreSQL Group Post Metadados Apagados. 🗑️', { postId: id, groupId: post.groupId });
                } else {
                    logService.logEvent('PostgreSQL Feed Metadados Apagados. 🗑️', { postId: id });
                }
    
                if (post.media) {
                    const folder = post.groupId ? 'group-media' : (post.type === 'video' ? 'reels' : 'feed');
                    logService.logEvent('Cloudflare Mídia Apagadas. 🗑️', { postId: id, folder });
                }
            }
    
        } catch(error) {
            console.error("Failed to delete post:", error);
            logService.logEvent('Falha ao apagar post. ❌', { postId: id, error: error.message });
            throw error;
        }
    }
};
