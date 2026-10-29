#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
====================================================================
 MATRIX TERMINAL CALCULATOR - NÚCLEO EM PYTHON
 Operações Básicas: Adição (+), Subtração (-), Multiplicação (*), Divisão (/)
====================================================================
"""

import sys
import json
import re
import argparse
from typing import Union, Tuple, Dict, Any

def adicao(a: float, b: float) -> float:
    """Retorna a soma de a e b."""
    return a + b

def subtracao(a: float, b: float) -> float:
    """Retorna a subtração de a por b."""
    return a - b

def multiplicacao(a: float, b: float) -> float:
    """Retorna o produto de a por b."""
    return a * b

def divisao(a: float, b: float) -> float:
    """Retorna o quociente de a por b. Lança ValueError em divisão por zero."""
    if b == 0:
        raise ValueError("ERRO_DIVISAO_ZERO: Não é possível dividir por zero.")
    return a / b

OPERATORS = {
    '+': adicao,
    '-': subtracao,
    '*': multiplicacao,
    '×': multiplicacao,
    '/': divisao,
    '÷': divisao,
}

def format_number(val: float) -> str:
    """Formata número eliminando casas decimais desnecessárias."""
    if abs(val - round(val)) < 1e-10:
        return str(int(round(val)))
    # Limita precisão a 8 dígitos significativos para evitar artefatos de ponto flutuante
    formatted = f"{val:.8f}".rstrip('0').rstrip('.')
    return formatted

def safe_evaluate_tokens(expr: str) -> Dict[str, Any]:
    """
    Avalia com segurança expressões aritméticas contendo apenas +, -, *, / e números.
    Respeita a ordem padrão de operações matematicas (multiplicação e divisão primeiro).
    """
    cleaned = expr.strip()
    if not cleaned:
        return {"success": True, "result": "0", "steps": []}

    # Normalizar símbolos
    normalized = cleaned.replace('×', '*').replace('÷', '/').replace(' ', '')

    # Validar caracteres permitidos
    if not re.match(r'^[0-9\.\+\-\*\/]+$', normalized):
        return {
            "success": False,
            "error": "Sintaxe inválida: caracteres não permitidos detectados.",
            "expr": expr
        }

    # Tokenização
    tokens = re.findall(r'(\d+(?:\.\d+)?|[\+\-\*\/])', normalized)
    if not tokens:
        return {"success": False, "error": "Expressão vazia.", "expr": expr}

    # Lidar com número negativo inicial se houver
    if tokens[0] == '-':
        if len(tokens) > 1 and re.match(r'^\d', tokens[1]):
            tokens = [f"-{tokens[1]}"] + tokens[2:]
        else:
            return {"success": False, "error": "Operador '-' sem operando inicial.", "expr": expr}
    elif tokens[0] in ['+', '*', '/']:
        return {"success": False, "error": f"Expressão não pode iniciar com operador '{tokens[0]}'.", "expr": expr}

    # Validar se o último token é um operador
    if tokens[-1] in ['+', '-', '*', '/']:
        return {
            "success": False,
            "error": f"Expressão incompleta (termina com '{tokens[-1]}').",
            "expr": expr
        }

    # Passo 1: Multiplicação e Divisão
    steps = []
    i = 0
    new_tokens = []
    while i < len(tokens):
        token = tokens[i]
        if token in ['*', '/']:
            if not new_tokens or i + 1 >= len(tokens):
                return {"success": False, "error": "Erro de sintaxe nos operandos.", "expr": expr}
            prev_num = float(new_tokens.pop())
            next_token = tokens[i + 1]
            try:
                next_num = float(next_token)
            except ValueError:
                return {"success": False, "error": f"Operando inválido: {next_token}", "expr": expr}

            op_func = OPERATORS[token]
            try:
                res = op_func(prev_num, next_num)
                steps.append(f"{format_number(prev_num)} {token} {format_number(next_num)} = {format_number(res)}")
                new_tokens.append(str(res))
                i += 2
                continue
            except ValueError as ve:
                return {"success": False, "error": str(ve), "expr": expr}
        else:
            new_tokens.append(token)
            i += 1

    # Passo 2: Adição e Subtração
    i = 0
    current_val = float(new_tokens[0])
    i = 1
    while i < len(new_tokens):
        op = new_tokens[i]
        if op not in ['+', '-']:
            return {"success": False, "error": f"Operador inesperado: {op}", "expr": expr}
        if i + 1 >= len(new_tokens):
            return {"success": False, "error": "Operando ausente.", "expr": expr}
        next_val = float(new_tokens[i + 1])
        op_func = OPERATORS[op]
        prev_res = current_val
        current_val = op_func(current_val, next_val)
        steps.append(f"{format_number(prev_res)} {op} {format_number(next_val)} = {format_number(current_val)}")
        i += 2

    return {
        "success": True,
        "result": format_number(current_val),
        "numeric_result": current_val,
        "expression": expr,
        "steps": steps
    }

def print_matrix_banner():
    banner = """
\033[1;32m
 ╔════════════════════════════════════════════════════════════╗
 ║         >>> MATRIX TERMINAL CALCULATOR v1.0.4 <<<          ║
 ║                 [ MOTOR PYTHON 3 NATIVO ]                  ║
 ║        Operações: Adição (+) | Subtração (-)               ║
 ║                   Multiplicação (*) | Divisão (/)          ║
 ╚════════════════════════════════════════════════════════════╝
\033[0m"""
    print(banner)

def interactive_cli():
    """Modo interativo no console com estilo terminal verde."""
    print_matrix_banner()
    print("\033[32mDigite a expressão aritmética (ou 'sair'/'exit' para finalizar):\033[0m")
    while True:
        try:
            user_input = input("\033[1;32mMATRIX:/> \033[0m").strip()
            if user_input.lower() in ['sair', 'exit', 'quit', 'q']:
                print("\033[32m[!] Sessão encerrada. Desconectando da Matrix...\033[0m")
                break
            if not user_input:
                continue
            res = safe_evaluate_tokens(user_input)
            if res["success"]:
                print(f"\033[1;32m[RESULTADO]: {res['result']}\033[0m")
                if res["steps"]:
                    print(f"\033[2;32m  └─ Passos: {' -> '.join(res['steps'])}\033[0m")
            else:
                print(f"\033[1;31m[ERRO]: {res['error']}\033[0m")
        except (KeyboardInterrupt, EOFError):
            print("\n\033[32m[!] Interrompido pelo usuário.\033[0m")
            break

def main():
    parser = argparse.ArgumentParser(description="Calculadora Matrix Terminal em Python")
    parser.add_argument("--eval", type=str, help="Expressão matemática para avaliar")
    parser.add_argument("--json", action="store_true", help="Saída em formato JSON para integração com backend")
    args = parser.parse_args()

    if args.eval:
        result = safe_evaluate_tokens(args.eval)
        if args.json:
            print(json.dumps(result))
        else:
            if result["success"]:
                print(result["result"])
            else:
                print(f"ERRO: {result['error']}", file=sys.stderr)
                sys.exit(1)
    else:
        interactive_cli()

if __name__ == "__main__":
    main()
