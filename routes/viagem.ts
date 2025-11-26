import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const viagemSchema = z.object({
  destino: z.string().min(4, { message: "Destino deve possuir, no mínimo, 4 caracteres" }),
  data_inicio: z.string(), // ISO date string
  data_fim: z.string(),    // ISO date string
  preco: z.number().positive({ message: "Preço deve ser positivo" })
})

// Listar todas as viagens
router.get("/", async (req, res) => {
  try {
    const viagens = await prisma.viagem.findMany({
      include: { reservas: true }
    })
    res.status(200).json(viagens)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// Criar uma nova viagem
router.post("/", async (req, res) => {
  const valida = viagemSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { destino, data_inicio, data_fim, preco } = valida.data

  try {
    const viagem = await prisma.viagem.create({
      data: {
        destino,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        preco
      }
    })
    res.status(201).json(viagem)
  } catch (error) {
    res.status(400).json({ error })
  }
})

// Deletar uma viagem
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const viagem = await prisma.viagem.delete({
      where: { id_viagem: Number(id) }
    })
    res.status(200).json(viagem)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

// Atualizar uma viagem
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const valida = viagemSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { destino, data_inicio, data_fim, preco } = valida.data

  try {
    const viagem = await prisma.viagem.update({
      where: { id_viagem: Number(id) },
      data: {
        destino,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        preco
      }
    })
    res.status(200).json(viagem)
  } catch (error) {
    res.status(400).json({ error })
  }
})

export default router