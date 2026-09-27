# ADR 001 — Escolha da LLM para Geração de SQL

**Data:** 2026-09-25
**Status:** Aceito
**Autor:** Alexandre Rodrigues

## Contexto

Precisamos de uma LLM capaz de traduzir perguntas em linguagem natural (português) para SQL preciso e otimizado. O projeto é gratuito e voltado para analistas de dados, então custo zero e baixa latência são requisitos.

## Decisão

Escolhemos a **API da Groq** rodando o modelo **GPT-OSS 120B**.

## Alternativas Consideradas

| Alternativa | Prós | Contras | Decisão |
|------------|------|---------|---------|
| OpenAI GPT-4 | Alta qualidade | Pago (~$30/mês estimado) | ❌ Rejeitado |
| Ollama local | Privacidade total | Requer GPU, inviável no Codespaces | ❌ Rejeitado |
| Groq + Llama 3.3 70B | Grátis, rápido | Modelo removido da Groq em 2026 | ❌ Indisponível |
| **Groq + GPT-OSS 120B** | **Grátis, 120B params, rápido** | **Limite de 14.4k req/dia** | ✅ Aceito |
| Groq + Qwen 3.8 27B | Grátis, leve | Menor capacidade para SQL complexo | 🔄 Backup |

## Consequências

- **Positivas:**
  - Custo zero para o desenvolvedor e usuários
  - Latência baixa (~1-3s por query) graças ao hardware Groq (LPU)
  - 14.400 requisições/dia é mais que suficiente para uso individual
  - Modelo grande (120B) garante qualidade nas queries

- **Negativas:**
  - Dependência de serviço externo (Groq)
  - Se o modelo for descontinuado, precisamos trocar (já aconteceu com o Llama 3.3)
  - Limite de rate pode ser problema se escalar para muitos usuários

- **Mitigação:**
  - O código usa variável de ambiente para o model name, facilitando troca
  - Qwen 3.8 27B como fallback já testado

## Referências

- [Groq Console](https://console.groq.com)
- [Groq Models Documentation](https://console.groq.com/docs/models)