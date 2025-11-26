import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number | string;
  nome?: string;
}

// Interface estendida
interface AuthRequest extends Request {
  userId?: number;
  userNome?: string;
  userLogadoId?: number;
  userLogadoNome?: string;
}

export function verificaToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({ erro: "Token não informado." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ erro: "Formato de token inválido." });
  }

  const token = parts[1];

  const JWT_KEY = process.env.JWT_KEY || process.env.JWT_SECRET;
  if (!JWT_KEY) {
    return res.status(500).json({ erro: "Chave JWT ausente no servidor." });
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY as string);
    const { id, nome } = decoded as TokenPayload;

    const numericId = typeof id === "string" ? Number(id) : id;

    // Agora TypeScript aceita sem reclamar
    req.userId = numericId;
    req.userNome = nome;
    req.userLogadoId = numericId;
    req.userLogadoNome = nome;

    next();
  } catch (erro) {
    console.error("verificaToken error:", erro);
    return res.status(401).json({ erro: "Token inválido." });
  }
}

export default verificaToken;
