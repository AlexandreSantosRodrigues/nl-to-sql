"use client";

import { useState, useRef } from "react";

const SCHEMAS: Record<string, string> = {
  ecommerce: `
CREATE TABLE clientes (id INT PRIMARY KEY, nome VARCHAR(100), email VARCHAR(100), pais VARCHAR(50), cidade VARCHAR(50), data_cadastro DATE);
CREATE TABLE pedidos (id INT PRIMARY KEY, cliente_id INT, data_pedido DATE, valor_total DECIMAL(10,2), status VARCHAR(20));
CREATE TABLE produtos (id INT PRIMARY KEY, nome VARCHAR(100), categoria VARCHAR(50), preco DECIMAL(10,2), estoque INT);
CREATE TABLE itens_pedido (id INT PRIMARY KEY, pedido_id INT, produto_id INT, quantidade INT, preco_unitario DECIMAL(10,2));
  `.trim(),
  financeiro: `
CREATE TABLE contas (id INT PRIMARY KEY, cliente_id INT, tipo VARCHAR(20), saldo DECIMAL(15,2), data_abertura DATE);
CREATE TABLE transacoes (id INT PRIMARY KEY, conta_id INT, tipo VARCHAR(20), valor DECIMAL(15,2), data_transacao DATETIME, descricao VARCHAR(200));
CREATE TABLE clientes (id INT PRIMARY KEY, nome VARCHAR(100), cpf VARCHAR(14), renda_mensal DECIMAL(10,2));
  `.trim(),
  rh: `
CREATE TABLE funcionarios (id INT PRIMARY KEY, nome VARCHAR(100), cargo VARCHAR(50), departamento VARCHAR(50), salario DECIMAL(10,2), data_admissao DATE, ativo BOOLEAN);
CREATE TABLE departamentos (id INT PRIMARY KEY, nome VARCHAR(50), gerente_id INT, orcamento DECIMAL(15,2));
CREATE TABLE ferias (id INT PRIMARY KEY, funcionario_id INT, data_inicio DATE, data_fim DATE, status VARCHAR(20));
  `.trim(),
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [schema, setSchema] = useState("ecommerce");
  const [customSchema, setCustomSchema] = useState("");
  const [sql, setSql] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFiles((prev) => [...prev, { name: file.name, content }]);
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function buildContext(): string {
    let context = useCustom ? customSchema : SCHEMAS[schema];

    if (files.length > 0) {
      context += "\n\nARQUIVOS ADICIONAIS DO USUÁRIO:\n";
           files.forEach((file) => {
        const lines = file.content.split("\n");
        const preview = lines.slice(0, 50).join("\n");
        context += `\n--- Arquivo: ${file.name} (primeiras 50 linhas) ---\n${preview}\n`;
      });
    }

    return context;
  }

  async function handleTranslate() {
    if (!question.trim()) return;
    setLoading(true);
    setSql("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          schema: buildContext(),
        }),
      });
      const data = await res.json();
      setSql(data.sql || data.error || "Erro desconhecido");
    } catch {
      setSql("Erro ao conectar com a API");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">🗄️ NL → SQL</h1>
          <p className="text-gray-400 text-lg">
            Digite sua pergunta em português e receba a query SQL pronta
          </p>
        </header>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            📋 Schema do Banco
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(SCHEMAS).map((key) => (
              <button
                key={key}
                onClick={() => { setSchema(key); setUseCustom(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  schema === key && !useCustom
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setUseCustom(!useCustom)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                useCustom
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              ✏️ Personalizado
            </button>
          </div>

          {useCustom ? (
            <textarea
              value={customSchema}
              onChange={(e) => setCustomSchema(e.target.value)}
              placeholder="Cole seu CREATE TABLE aqui..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-green-400 placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <pre className="bg-gray-800 rounded-lg p-3 text-sm font-mono text-green-400 overflow-x-auto">
              {SCHEMAS[schema]}
            </pre>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            📎 Arquivos de Contexto
          </h2>
          <p className="text-gray-500 text-sm mb-3">
            Envie arquivos .sql, .csv ou .txt para dar mais contexto à IA
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.csv,.txt,.json"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-dashed border-gray-600 hover:border-gray-500"
          >
            📁 Escolher Arquivos
          </button>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400">
                      📄 {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕ Remover
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-gray-400 max-h-24 overflow-y-auto">
                    {file.content.slice(0, 500)}
                    {file.content.length > 500 ? "\n..." : ""}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            💬 Sua Pergunta
          </h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTranslate();
              }
            }}
            placeholder='Ex: "Mostre todos os clientes do Brasil que compraram no último mês"'
            className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !question.trim()}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? "⏳ Gerando SQL..." : "🚀 Traduzir para SQL"}
          </button>
        </div>

        {sql && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                🎯 SQL Gerado
              </h2>
              <button
                onClick={handleCopy}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-lg transition-colors"
              >
                {copied ? "✅ Copiado!" : "📋 Copiar"}
              </button>
            </div>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm font-mono text-yellow-300 overflow-x-auto whitespace-pre-wrap">
              {sql}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}