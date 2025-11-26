import { PrismaClient } from '@prisma/client'
import { Router, Request } from 'express'
import { z } from 'zod'
import verificaToken from "./verificaToken"

const prisma = new PrismaClient()
const router = Router()

// Interface para Request autenticado
interface AuthRequest extends Request {
  userLogadoId?: number;
  userId?: number;
  userNome?: string;
  userLogadoNome?: string;
}

const pagamentoSchema = z.object({
  id_reserva: z.number(),
  valor: z.number().positive({ message: "Valor deve ser positivo" }),
  forma_pagamento: z.enum(["PIX", "Cartao", "Dinheiro"])
})

// =====================================
// LISTAR PAGAMENTOS (opcional com token)
// =====================================
router.get("/", verificaToken, async (req, res) => {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include: {
        reserva: {
          include: {
            cliente: true,
            viagem: true,
            usuario: true
          }
        }
      }
    })
    res.status(200).json(pagamentos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// =====================================
// CRIAR PAGAMENTO  (token + log)
// =====================================
router.post("/", verificaToken, async (req, res) => {
  const valida = pagamentoSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ erro: valida.error })
  }

  const { id_reserva, valor, forma_pagamento } = valida.data

  const reserva = await prisma.reserva.findUnique({ where: { id_reserva } })
  if (!reserva) {
    return res.status(400).json({ erro: "Reserva não encontrada" })
  }

  try {
    // cria o pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        id_reserva,
        valor,
        forma_pagamento
      }
    })

    // LOG DO PAGAMENTO - usando cast para AuthRequest
    const authReq = req as AuthRequest;
    await prisma.log.create({
      data: {
        acao: `Pagamento realizado (reserva ${id_reserva})`,
        usuarioId: authReq.userLogadoId!
      }
    })

    // atualiza status da reserva
    await prisma.reserva.update({
      where: { id_reserva },
      data: { status: "realizado" }
    })

    return res.status(201).json(pagamento)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

export default router