import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { question, schema } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "Pergunta é obrigatória" },
        { status: 400 }
      );
    }

    const prompt = `
Você é um Arquiteto de Banco de Dados Sênior com 15 anos de experiência.
Sua única função é traduzir perguntas em português para SQL preciso e otimizado.

REGRAS ABSOLUTAS:
- Responda APENAS com código SQL válido
- Nunca adicione explicações, comentários ou texto extra
- Use sempre aliases legíveis (ex: c para clientes)
- Prefira JOINs explícitos a subqueries quando possível
- Use nomes de tabelas e colunas exatamente como definidos no schema
- NUNCA use DELETE, DROP ou TRUNCATE. Se o usuário pedir para remover ou excluir dados, use UPDATE com um campo de status (ex: UPDATE tabela SET ativo = FALSE WHERE ...) ou use SELECT para OCULTAR os registros indesejados com WHERE NOT
- Segurança é prioridade: gere apenas SELECT, INSERT e UPDATE

SCHEMA DO BANCO DE DADOS:
${schema || "Nenhum schema fornecido. Use nomes genéricos de tabelas e colunas."}

PERGUNTA DO USUÁRIO:
"${question}"

SQL:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      max_tokens: 1024,
    });

    const sql = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ sql });
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro ao gerar SQL" },
      { status: 500 }
    );
  }
}



