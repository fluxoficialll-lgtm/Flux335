
import jwt from 'jsonwebtoken';
import { dbManager } from '../databaseManager.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Função para decodificar o token e extrair o ID do usuário
export const decodeToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;

    try {
        // A carga útil do token contém `id`, e não `userId`. Esta é a correção.
        const decoded = jwt.verify(token, JWT_SECRET);
        return { userId: decoded.id }; 
    } catch (error) {
        console.error("Erro ao decodificar token:", error.message);
        return null;
    }
};

// Middleware de autenticação completo
export const authMiddleware = async (req, res, next) => {
    const decoded = decodeToken(req);

    if (!decoded || !decoded.userId) {
        return res.status(401).json({ message: "Token de autenticação inválido ou ausente." });
    }

    try {
        const user = await dbManager.users.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        
        if (user.isBanned) {
            return res.status(403).json({ message: "Usuário banido." });
        }

        req.userId = decoded.userId; // Anexa o ID do usuário à requisição
        req.user = user; // Anexa o objeto de usuário completo
        next();
    } catch (error) {
        console.error("Erro no middleware de autenticação:", error);
        return res.status(500).json({ message: "Erro interno do servidor durante a autenticação." });
    }
};
