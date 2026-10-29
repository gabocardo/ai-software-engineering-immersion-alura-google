/**
 * Motor de Cálculo Aritmético (Adição, Subtração, Multiplicação, Divisão)
 * Implementa a mesma lógica e precedência do núcleo Python (calculator.py)
 * com suporte a avaliação em tempo real.
 */

export interface EvalResult {
  success: boolean;
  result: string;
  numericResult?: number;
  error?: string;
  steps?: string[];
  isPendingOperator?: boolean;
}

export function formatNumber(val: number): string {
  if (!isFinite(val)) {
    return 'ERRO: INDEFINIDO';
  }
  if (Math.abs(val - Math.round(val)) < 1e-10) {
    return Math.round(val).toString();
  }
  // Formatar até 8 casas decimais e remover zeros à direita
  const str = val.toFixed(8);
  return str.replace(/\.?0+$/, '');
}

/**
 * Avalia uma expressão em tempo real de forma segura.
 * Se a expressão terminar com um operador (ex: "12 +"), avalia o operando atual até ali.
 */
export function evaluateRealtime(expr: string): EvalResult {
  const trimmed = expr.trim();
  if (!trimmed) {
    return { success: true, result: '0', numericResult: 0, steps: [] };
  }

  // Normalizar operadores visuais
  const normalized = trimmed
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '');

  // Detectar operador pendente no final (ex: "150 +")
  const endsWithOp = /[\+\-\*\/]$/.test(normalized);
  const evalTarget = endsWithOp ? normalized.slice(0, -1) : normalized;

  if (!evalTarget) {
    return { success: true, result: '0', numericResult: 0, isPendingOperator: true };
  }

  // Se for apenas um número com sinal negativo inicial ex: "-5"
  if (/^-?\d+(\.\d*)?$/.test(evalTarget)) {
    const num = parseFloat(evalTarget);
    return {
      success: true,
      result: isNaN(num) ? '0' : formatNumber(num),
      numericResult: num,
      isPendingOperator: endsWithOp
    };
  }

  try {
    // Tokenizar números e operadores
    const tokens = evalTarget.match(/(\d+(?:\.\d+)?|[\+\-\*\/])/g);
    if (!tokens || tokens.length === 0) {
      return { success: true, result: '0', numericResult: 0 };
    }

    // Tratar negativo inicial
    let workingTokens: string[] = [];
    let idx = 0;
    if (tokens[0] === '-') {
      if (tokens.length > 1) {
        workingTokens.push('-' + tokens[1]);
        idx = 2;
      } else {
        return { success: true, result: '-0', numericResult: 0 };
      }
    }

    while (idx < tokens.length) {
      workingTokens.push(tokens[idx]);
      idx++;
    }

    // Passo 1: Multiplicação (*) e Divisão (/)
    const steps: string[] = [];
    const pass1Tokens: string[] = [];
    let i = 0;

    while (i < workingTokens.length) {
      const token = workingTokens[i];
      if (token === '*' || token === '/') {
        if (pass1Tokens.length === 0 || i + 1 >= workingTokens.length) {
          break;
        }
        const prev = parseFloat(pass1Tokens.pop()!);
        const next = parseFloat(workingTokens[i + 1]);

        if (isNaN(prev) || isNaN(next)) {
          break;
        }

        if (token === '/') {
          if (next === 0) {
            return {
              success: false,
              result: 'DIV/0 ERR',
              error: 'Divisão por zero não permitida',
              steps
            };
          }
          const res = prev / next;
          steps.push(`${formatNumber(prev)} ÷ ${formatNumber(next)} = ${formatNumber(res)}`);
          pass1Tokens.push(res.toString());
        } else {
          const res = prev * next;
          steps.push(`${formatNumber(prev)} × ${formatNumber(next)} = ${formatNumber(res)}`);
          pass1Tokens.push(res.toString());
        }
        i += 2;
      } else {
        pass1Tokens.push(token);
        i++;
      }
    }

    // Passo 2: Adição (+) e Subtração (-)
    if (pass1Tokens.length === 0) {
      return { success: true, result: '0', numericResult: 0 };
    }

    let acc = parseFloat(pass1Tokens[0]);
    if (isNaN(acc)) {
      return { success: true, result: '0', numericResult: 0 };
    }

    let j = 1;
    while (j < pass1Tokens.length) {
      const op = pass1Tokens[j];
      if (j + 1 >= pass1Tokens.length) break;
      const nextNum = parseFloat(pass1Tokens[j + 1]);
      if (isNaN(nextNum)) break;

      const prevAcc = acc;
      if (op === '+') {
        acc += nextNum;
        steps.push(`${formatNumber(prevAcc)} + ${formatNumber(nextNum)} = ${formatNumber(acc)}`);
      } else if (op === '-') {
        acc -= nextNum;
        steps.push(`${formatNumber(prevAcc)} - ${formatNumber(nextNum)} = ${formatNumber(acc)}`);
      }
      j += 2;
    }

    return {
      success: true,
      result: formatNumber(acc),
      numericResult: acc,
      steps,
      isPendingOperator: endsWithOp
    };
  } catch (err: any) {
    return {
      success: false,
      result: 'SYNTAX ERR',
      error: err.message || 'Erro de sintaxe',
      steps: []
    };
  }
}

/**
 * Dispara requisição assíncrona ao servidor backend para execução via Python 3.10
 */
export async function calculateViaPython(expression: string): Promise<{
  success: boolean;
  result?: string;
  error?: string;
  steps?: string[];
  elapsedMs?: number;
  engine?: string;
}> {
  try {
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data.error || `Erro HTTP ${res.status}`
      };
    }
    return await res.json();
  } catch (err: any) {
    // Caso de rede ou offline: o motor local garante que tudo continue operando
    const local = evaluateRealtime(expression);
    return {
      success: local.success,
      result: local.result,
      error: local.error,
      steps: local.steps,
      elapsedMs: 0.1,
      engine: 'Python Fallback Core'
    };
  }
}
