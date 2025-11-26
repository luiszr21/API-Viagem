import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import verificaToken from "./verificaToken";

const prisma = new PrismaClient();
const router = Router();

// Lista todos os logs
router.get("/", verificaToken, async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      include: {
        usuario: {
          select: { id_usuario: true, nome: true, email: true }
        }
      },
      orderBy: { data: "desc" }
    });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

export default router;
