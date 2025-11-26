import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"

const prisma = new PrismaClient()
const router = Router()

const clienteSchema = z.object({
  nome: z.string().min(10, { message: "Nome deve possuir, no mínimo, 10 caracteres" }),
  cpf: z.string().length(11, { message: "O CPF deve conter 11 caracteres" }),
  telefone: z.string().length(9, { message: "O telefone deve ter 9 caracteres" }),
  email: z.string().email().min(10, { message: "E-mail, no mínimo, 10 caracteres" })
})

router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany()
    res.status(200).json(clientes)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = clienteSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, cpf, telefone, email } = valida.data

  try {
    const cliente = await prisma.cliente.create({
      data: { nome, cpf, telefone, email }
    })
    res.status(201).json(cliente)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const cliente = await prisma.cliente.delete({
      where: { id_cliente: Number(id) }
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const valida = clienteSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, cpf, telefone, email } = valida.data
  try {
    const cliente = await prisma.cliente.update({
      where: { id_cliente: Number(id) },
      data: { nome, cpf, telefone, email }
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json({ error })
  }
})

// Geração do HTML do e-mail de reservas
function reservasHTML(dados: any) {
  let html = `
    <html>
    <body style="font-family:  Arial, sans-serif;">
    <h2>Relatório de Reservas de Viagem</h2>
    <h3>Cliente: ${dados.nome}</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead style="background-color: rgb(195, 191, 191);">
        <tr>
          <th>Destino</th>
          <th>Data de Início</th>
          <th>Data de Fim</th>
          <th>Valor R$</th>
          <th>Status do Pagamento</th>
        </tr>
      </thead>
      <tbody>
  `;

  let totalReservas = 0;
  for (const reserva of dados.reservas) {
    totalReservas += Number(reserva.viagem.preco)
    const dataInicio = new Date(reserva.viagem.data_inicio).toLocaleDateString('pt-BR')
    const dataFim = new Date(reserva.viagem.data_fim).toLocaleDateString('pt-BR')
    html += `
      <tr>
        <td>${reserva.viagem.destino}</td>
        <td>${dataInicio}</td>
        <td>${dataFim}</td>
        <td style="text-align: right;">${Number(reserva.viagem.preco).toLocaleString("pt-br", { minimumFractionDigits: 2 })}</td>
        <td>${reserva.status}</td>
      </tr>
    `;
  }

  html += `
      <tr style="font-weight: bold; background-color:rgb(235, 232, 232);">
        <td colspan="3" style="text-align: right;">Total Reservas:</td>
        <td style="text-align: right;">R$ ${totalReservas.toLocaleString("pt-br", { minimumFractionDigits: 2 })}  </td>
        <td></td>
      </tr>
    </tbody>
  </table>
  </body>
  </html>
  `;
  return html;
}

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_EMAIL,
    pass: process.env.MAILTRAP_SENHA
  },
});

// Função para envio de e-mail de reservas
async function enviaEmailReservas(dados: any) {
  try {
    const mensagem = reservasHTML(dados)
    const info = await transporter.sendMail({
      from: 'Relatório de Reservas <no-reply@viagens.com>',
      to: dados.email,
      subject: "Relatório de Reservas de Viagem",
      html: mensagem,
    })
    console.log("E-mail enviado:", info.messageId)
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err)
  }
}

// Endpoint para gerar e enviar o relatório de reservas
router.get("/email/:id", async (req, res) => {
  const { id } = req.params
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: Number(id) },
      include: {
        reservas: {
          include: {
            viagem: true
          }
        }
      }
    })

    if (!cliente) {
      res.status(404).json({ erro: "Cliente não encontrado" })
      return
    }

    await enviaEmailReservas(cliente)
    res.status(200).json(cliente)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router