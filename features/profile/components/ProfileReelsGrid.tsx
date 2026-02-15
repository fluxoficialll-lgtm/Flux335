
import React from 'react';
import { authService } from '../../../services/authService';
import { postService } from '../../../services/postService';

export const ProfileReelsGrid: React.FC = () => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
        return <div className="text-center text-gray-400 mt-8">Usuário não encontrado.</div>;
    }

    const posts = postService.getUserPosts(currentUser.id);

    if (posts.length === 0) {
        return <div className="text-center text-gray-400 mt-8">Sem reels para mostrar.</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-1">
            {posts.map(post => (
                <div key={post.id} className="relative aspect-square bg-gray-800">
                    {post.video && 
                        <video src={post.video} className="w-full h-full object-cover" preload="metadata" />
                    }
                    <div className="absolute bottom-1 left-1 bg-black/50 rounded p-1 text-xs flex items-center">
                        <i className="fa-solid fa-play mr-1"></i> {post.views || 0}
                    </div>
                </div>
            ))}
        </div>
    );
};
