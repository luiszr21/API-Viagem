import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import verificaToken from "./verificaToken"


const prisma = new PrismaClient()
const router = Router()

const reservaSchema = z.object({
  id_cliente: z.number(),
  id_viagem: z.number(),
  email: z.string().email()
})

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_EMAIL,
    pass: process.env.MAILTRAP_SENHA
  },
})

async function enviaEmailReserva(dados: any) {
  const mensagem = `
    <h2>Confirmação da Reserva</h2>
    <p>Parabéns ${dados.nome}, sua reserva para ${dados.destino} de ${dados.data_inicio} até ${dados.data_fim} foi confirmada!</p>
    <p>Status do pagamento: ${dados.status}</p>
    <p>Valor: R$ ${dados.preco}</p>
  `
  await transporter.sendMail({
    from: 'Confirmação de Reserva <no-reply@viagens.com>',
    to: dados.email,
    subject: "Confirmação de Reserva de Viagem",
    html: mensagem,
  })
}

// ============================
// LISTAR TODAS AS RESERVAS
// ============================
router.get("/", async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        cliente: true,
        viagem: true,
        usuario: true
      }
    })
    res.status(200).json(reservas)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// ============================
// CRIAR RESERVA (com log + token)
// ============================
router.post("/", verificaToken, async (req, res) => {
  const valida = reservaSchema.safeParse(req.body)
  if (!valida.success) return res.status(400).json({ erro: valida.error })

  const { id_cliente, id_viagem, email } = valida.data

  const cliente = await prisma.cliente.findUnique({ where: { id_cliente } })
  if (!cliente) return res.status(400).json({ erro: "Cliente não encontrado" })

  const viagem = await prisma.viagem.findUnique({ where: { id_viagem } })
  if (!viagem) return res.status(400).json({ erro: "Viagem não encontrada" })

  try {
    // cria reserva pendente
    const usuarioId = (req as any).userLogadoId ?? (req as any).userId
    const reserva = await prisma.reserva.create({
      data: { 
        id_cliente, 
        id_viagem, 
        status: "pendente",
        usuarioId: usuarioId! // usuário logado
      }
    })

    const reservaAtualizada = await prisma.reserva.update({
      where: { id_reserva: reserva.id_reserva },
      data: { status: "realizado" }
    })

    // envia email
    await enviaEmailReserva({
      nome: cliente.nome,
      destino: viagem.destino,
      data_inicio: viagem.data_inicio,
      data_fim: viagem.data_fim,
      preco: viagem.preco,
      email,
      status: "realizado"
    })

    // 🔥 REGISTRA LOG
    await prisma.log.create({
      data: {
        acao: `Reserva criada para viagem ${id_viagem}`,
        usuarioId: usuarioId!
      }
    });

    return res.status(201).json(reservaAtualizada)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

// ============================
// ATUALIZAR RESERVA
// ============================
router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params
  const data = req.body

  try {
    const reserva = await prisma.reserva.findUnique({ where: { id_reserva: Number(id) } })
    if (!reserva) return res.status(404).json({ erro: "Reserva não encontrada" })

    const reservaAtualizada = await prisma.reserva.update({
      where: { id_reserva: Number(id) },
      data
    })

    // LOG opcional
    const usuarioId = (req as any).userLogadoId ?? (req as any).userId
    await prisma.log.create({
      data: {
        acao: `Reserva ${id} atualizada`,
        usuarioId: usuarioId!
      }
    });

    res.status(200).json(reservaAtualizada)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// ============================
// DELETAR RESERVA
// ============================
router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const reserva = await prisma.reserva.findUnique({ where: { id_reserva: Number(id) } })
    if (!reserva) return res.status(404).json({ erro: "Reserva não encontrada" })

    await prisma.reserva.delete({ where: { id_reserva: Number(id) } })

    // LOG opcional
    const usuarioId = (req as any).userLogadoId ?? (req as any).userId
    await prisma.log.create({
      data: {
        acao: `Reserva ${id} deletada`,
        usuarioId: usuarioId!
      }
    });

    res.status(200).json({ message: "Reserva deletada com sucesso" })
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router
