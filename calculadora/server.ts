import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route: Calcular usando o motor Python nativo
  app.post('/api/calculate', (req, res) => {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Expressão matemática não informada ou inválida.'
      });
    }

    const startTime = Date.now();
    const scriptPath = path.resolve(__dirname, 'calculator.py');

    execFile('python3', [scriptPath, '--eval', expression, '--json'], { timeout: 3000 }, (error, stdout, stderr) => {
      const elapsedMs = Date.now() - startTime;

      if (error && !stdout) {
        return res.status(500).json({
          success: false,
          error: stderr || error.message || 'Erro ao invocar Python 3.',
          elapsedMs
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        return res.json({
          ...parsed,
          elapsedMs,
          engine: 'Python 3.10 Core'
        });
      } catch (parseErr) {
        return res.status(500).json({
          success: false,
          error: 'Falha ao interpretar resposta do motor Python.',
          raw: stdout,
          elapsedMs
        });
      }
    });
  });

  // API Route: Obter o código-fonte em Python para inspeção e download
  app.get('/api/python-code', (_req, res) => {
    try {
      const scriptPath = path.resolve(__dirname, 'calculator.py');
      const code = fs.readFileSync(scriptPath, 'utf-8');
      res.json({ success: true, code, filename: 'calculator.py' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Executar comando de console / REPL Python simples
  app.post('/api/python-repl', (req, res) => {
    const { cmd } = req.body;
    if (!cmd || typeof cmd !== 'string') {
      return res.status(400).json({ success: false, output: 'Comando vazio.' });
    }

    // Apenas permitir comandos seguros de cálculo
    const sanitized = cmd.trim();
    const isExpr = /^[0-9\.\+\-\*\/\s\(\)]+$/.test(sanitized);

    const pyCode = isExpr
      ? `from calculator import safe_evaluate_tokens; print(safe_evaluate_tokens("${sanitized}")['result'])`
      : `print("Execução restrita a expressões aritméticas por segurança.")`;

    execFile('python3', ['-c', pyCode], { timeout: 2000 }, (err, stdout, stderr) => {
      if (err) {
        return res.json({ success: false, output: stderr || err.message });
      }
      return res.json({ success: true, output: stdout.trim() });
    });
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', runtime: 'Node + Python 3.10', timestamp: new Date().toISOString() });
  });

  // Modo Dev com Vite ou produção com static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Matrix Server] Iniciado na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Matrix Server Error]', err);
  process.exit(1);
});
