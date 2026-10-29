# Imersão em Engenharia de Software com IA — Alura + Google

Repositório de projetos desenvolvidos durante a imersão. Cada projeto fica em sua própria pasta.

## Projetos

- [Calculadora Terminal Matrix](./calculadora/): motor de cálculo em Python, interface React e servidor Node.js.

## Executar a calculadora

A partir da raiz do repositório:

```sh
cd calculadora
python3 calculator.py
```

No Windows, se necessário, use `python` no lugar de `python3` para executar o programa no terminal.

Para iniciar a interface web, instale Node.js/npm e tenha `python3` disponível no PATH (o servidor usa esse comando):

```sh
cd calculadora
npm install
npm run dev
```

Execute `cd calculadora` apenas se ainda estiver na raiz. Acesse http://localhost:3000.

Os comandos `npm run build` e `npm run lint` também devem ser executados dentro de `calculadora/`.

Ao configurar hospedagem ou ferramentas externas, use `calculadora/` como diretório raiz do aplicativo.

Novos projetos podem ser adicionados em outras pastas na raiz, ao lado de `calculadora/`.
