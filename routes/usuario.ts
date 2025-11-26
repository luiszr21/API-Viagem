import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import nodemailer from "nodemailer";

const router = Router();
const prisma = new PrismaClient();

// ===========================
//  VALIDADOR ZOD
// ===========================
const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres")
});

// ===========================
//  VALIDAÇÃO DE SENHA FORTE
// ===========================
function validaSenha(senha: string) {
  const erros: string[] = [];

  if (senha.length < 8) erros.push("Senha deve ter no mínimo 8 caracteres");

  if (!/[a-z]/.test(senha)) erros.push("Senha precisa de letra minúscula");
  if (!/[A-Z]/.test(senha)) erros.push("Senha precisa de letra maiúscula");
  if (!/[0-9]/.test(senha)) erros.push("Senha precisa de número");
  if (!/[^A-Za-z0-9]/.test(senha)) erros.push("Senha precisa de símbolo");

  return erros;
}

// ===========================
//  MAILTRAP
// ===========================
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_EMAIL,
    pass: process.env.MAILTRAP_SENHA,
  },
});

// ===========================
//  CADASTRAR
// ===========================
router.post("/cadastrar", async (req, res) => {
  const valida = usuarioSchema.safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error });

  const { nome, email, senha } = valida.data;

  const errosSenha = validaSenha(senha);
  if (errosSenha.length > 0) return res.status(400).json({ erro: errosSenha });

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) return res.status(400).json({ erro: "Email já cadastrado" });

  const hash = await bcrypt.hash(senha, 12);
  const codigoAtivacao = Math.random().toString(36).substring(2, 10).toUpperCase();

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: hash,
      status: "INATIVO",
      codigoAtivacao,
    }
  });

  await transporter.sendMail({
    from: "noreply@viagens.com",
    to: usuario.email,
    subject: "Código de Ativação",
    html: `<p>Seu código é: <strong>${codigoAtivacao}</strong></p>`
  });

  return res.status(201).json({ mensagem: "Usuário cadastrado. Verifique seu e-mail." });
});

// ===========================
//  ATIVAR POR CÓDIGO NA URL
// ===========================
router.post("/ativar/:codigo", async (req, res) => {
  const { codigo } = req.params;

  const usuario = await prisma.usuario.findFirst({
    where: { codigoAtivacao: codigo },
  });

  if (!usuario) return res.status(400).json({ erro: "Código inválido" });

  await prisma.usuario.update({
    where: { id_usuario: usuario.id_usuario },
    data: { status: "ATIVO", codigoAtivacao: null },
  });

  return res.status(200).json({ mensagem: "Conta ativada com sucesso!" });
});

// ===========================
//  ATIVAR POR EMAIL + CÓDIGO (POST /usuario/confirmar)
// ===========================
router.post("/confirmar", async (req, res) => {
  const { email, codigo } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return res.status(400).json({ erro: "Usuário não encontrado" });

  if (usuario.codigoAtivacao !== codigo)
    return res.status(400).json({ erro: "Código inválido" });

  await prisma.usuario.update({
    where: { email },
    data: { status: "ATIVO", codigoAtivacao: null }
  });

  return res.status(200).json({ mensagem: "Conta ativada com sucesso!" });
});

// ===========================
//  LOGIN
// ===========================
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return res.status(400).json({ erro: "Usuário não encontrado" });

  if (usuario.status !== "ATIVO")
    return res.status(403).json({ erro: "Ative sua conta antes de fazer login." });

  const ok = await bcrypt.compare(senha, usuario.senha);
  if (!ok) return res.status(400).json({ erro: "Senha incorreta" });

  const token = jwt.sign(
    { id: usuario.id_usuario, nome: usuario.nome },
    process.env.JWT_KEY as string,
    { expiresIn: "4h" }
  );

  return res.status(200).json({ mensagem: "Login realizado!", token });
});

export default router;
