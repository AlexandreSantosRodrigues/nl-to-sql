# 📋 Runbook — NL → SQL

Guia operacional para manter, debugar e evoluir o projeto.

**Dono:** Alexandre Rodrigues
**Última atualização:** 2026-09-25

---

## 🚀 Como Rodar Localmente

    npm install
    cp .env.example .env.local   # Preencha sua GROQ_API_KEY
    npm run dev                   # http://localhost:3000

## 🔑 Variáveis de Ambiente

| Variável | Obrigatória | Onde obter |
|----------|-------------|-----------|
| GROQ_API_KEY | Sim | console.groq.com/keys |

## 🐛 Troubleshooting

### Erro: "Erro ao gerar SQL"
**Causa provável:** API Key inválida ou modelo indisponível.
**Solução:**
1. Verifique se .env.local existe e contém GROQ_API_KEY=gsk_...
2. Reinicie o servidor (Ctrl+C e depois npm run dev)
3. Verifique os modelos disponíveis com curl na API da Groq
4. Atualize o model name em src/app/api/translate/route.ts

### Erro: "Erro ao conectar com a API"
**Causa provável:** Arquivo enviado muito grande (estoura tokens).
**Solução:** O sistema limita a 50 linhas por arquivo. Se o erro persistir, use arquivos menores ou cole só o schema no modo Personalizado.

### Erro: "model_not_found"
**Causa provável:** Groq descontinuou o modelo.
**Solução:**
1. Liste modelos disponíveis na API da Groq
2. Escolha um modelo de chat (ex: qwen/qwen3.8-27b)
3. Atualize a linha model em route.ts

## 🔄 Como Trocar o Modelo

1. Abra src/app/api/translate/route.ts
2. Altere a linha model: "openai/gpt-oss-120b" para o novo modelo
3. Salve e reinicie o servidor

## 🛡️ Regras de Segurança (Prompt)

O prompt em route.ts contém regras que NUNCA devem ser removidas:
- **Proibição de DELETE/DROP/TRUNCATE** — proteção contra perda de dados
- **Apenas SELECT, INSERT e UPDATE** — operações seguras
- Se o usuário pedir exclusão, a IA usa UPDATE ... SET ativo = FALSE

## 📦 Deploy

Push para o GitHub e o deploy é automático via integração GitHub e Vercel.