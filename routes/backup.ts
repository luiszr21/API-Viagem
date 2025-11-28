import { Router } from "express";
import { exec } from "child_process";
import path from "path";

const router = Router();


const backupPath = path.join(__dirname, "../backup.sql");

// GERAR BACKUP
router.get("/backup", (req, res) => {
  exec(`mysqldump -u root viagem > ${backupPath}`, (erro) => {
    if (erro) {
      return res.status(500).json({ erro: "Erro ao gerar backup", detalhes: erro });
    }
    res.download(backupPath);
  });
});

// RESTAURAR BACKUP
router.post("/restore", (req, res) => {
  exec(`mysql -u root viagem < ${backupPath}`, (erro) => {
    if (erro) {
      return res.status(500).json({ erro: "Erro ao restaurar backup", detalhes: erro });
    }
    res.json({ mensagem: "Banco restaurado com sucesso!" });
  });
});

export default router;
