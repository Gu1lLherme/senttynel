# ❌ Prompts que Falharam — Aprendizados

Documento de rastreabilidade de **prompts que produziram outputs incorretos** durante o desenvolvimento do SENTINEL, junto com os ajustes aplicados e a estratégia de validação.

---

## 🔴 Caso 1 — Classificador de Risco gerando severidade "crítica" para movimentos normais

### ❌ Prompt original (v1)
```
Analise os dados do acelerômetro e diga se houve uma queda.
Responda em JSON: { "fell": boolean, "severity": "low|medium|high|critical" }
```

### 🐛 Falha observada
A IA classificou **40% dos eventos comuns** (corrida, descer escada, sentar bruscamente) como `severity: "critical"`, acionando notificações de emergência indevidas para os contatos de confiança. Em um teste real, um usuário praticando esportes disparou 6 SOS em 20 minutos.

### 🔍 Causa raiz
- Prompt **muito vago** — sem critérios objetivos para cada nível de severidade.
- Sem contexto temporal (não considerava histórico de 5min).
- Sem instrução anti-alucinação.
- Schema permissivo (não exigia `risk_score` numérico).

### ✅ Prompt corrigido (v2 — em produção)
```
Você é um agente de segurança pessoal especializado em analisar dados
biométricos e contextuais. Receberá leituras de acelerômetro, giroscópio,
GPS e histórico de movimento dos últimos 5 minutos.

Regras de severidade OBRIGATÓRIAS:
- 0-25  → baixo (falso positivo provável)
- 26-50 → médio (perguntar "Está tudo bem?")
- 51-79 → alto (notificar contatos)
- 80+   → crítico (acionar SOS automático)

NUNCA invente dados. Se inputs insuficientes, retorne severity="baixo".
Considere atividade prévia: se últimos 5min mostram corrida/exercício,
reduza score em 30%.
```
+ schema com `risk_score: number (0-100)` obrigatório.

### 🧪 Validação
- Bateria de **50 inputs sintéticos** cobrindo: queda real, corrida, descer escada, sentar, dropar celular, atividade esportiva.
- Meta: <5% de falsos positivos em `crítico`.
- **Resultado após v2:** 2% de falsos positivos (1 em 50).
- Teste A/B em 3 usuários beta por 1 semana — zero SOS indevidos.

---

## 🔴 Caso 2 — Geocodificador inventando coordenadas para endereços ambíguos

### ❌ Prompt original (v1)
```
Converta este endereço em latitude e longitude: "{{ADDRESS}}"
Responda em JSON com lat e lng.
```

### 🐛 Falha observada
Para endereços incompletos como `"Rua das Flores"` (existe em 1.200+ cidades brasileiras), a IA **retornava coordenadas com alta confiança** apontando para locais aleatórios — geralmente São Paulo capital. Um usuário cadastrou a zona segura da escola do filho em **Rua das Flores, Caxias do Sul** e o sistema marcou a localização em **São Paulo, 1.000km de distância**, gerando falsos alertas de "saiu da zona segura" toda hora.

### 🔍 Causa raiz
- Sem instrução para **detectar ambiguidade**.
- Sem campo `confidence` no schema.
- Sem permissão para **falhar explicitamente** (`success: false`).
- Sem uso de `add_context_from_internet` para validar.

### ✅ Prompt corrigido (v2 — em produção)
```
Converta o seguinte endereço em coordenadas geográficas precisas (Brasil):

"{{ADDRESS}}"

Use contexto da internet para encontrar a localização exata.
Se houver AMBIGUIDADE (endereço incompleto, sem cidade/CEP, ou múltiplas
ocorrências possíveis no Brasil), retorne success=false e peça mais
detalhes via "needs_clarification".

NUNCA "chute" coordenadas. Prefira falhar a inventar.
```
+ schema com `confidence: "high" | "medium" | "low"` e `success: boolean`.
+ ativado `add_context_from_internet: true`.

### 🧪 Validação
- Conjunto de **30 endereços de teste**: 10 completos, 10 ambíguos, 10 inválidos.
- Meta: 100% dos ambíguos devem retornar `success=false` ou `confidence="low"`.
- **Resultado após v2:** 28/30 corretos (93%); 2 casos de baixa confiança aceitos com aviso no UI.
- Frontend agora exibe modal "Confirme a localização no mapa" quando `confidence !== "high"`.

---

## 🧰 Estratégia geral de validação de outputs de IA

| Etapa | Como fazemos |
|---|---|
| **1. Casos de teste sintéticos** | 30-50 inputs cobrindo bordas, ambiguidades e adversariais |
| **2. Schema estrito** | `response_json_schema` com tipos, enums e ranges obrigatórios |
| **3. Validação no backend** | Funções Deno checam `risk_score` entre 0-100, `lat/lng` válidos antes de persistir |
| **4. Fallback seguro** | Em qualquer dúvida → menor severidade / `success=false` |
| **5. Teste com usuários reais** | Beta de 1 semana com 3 famílias antes de cada release |
| **6. Telemetria** | Tabela `Alert.notes` armazena raciocínio da IA para auditoria posterior |
| **7. Revisão humana** | Falsos positivos reportados em `status: "falso_positivo"` realimentam ajustes |

---

## 📊 Métricas pós-correção

| Indicador | v1 (inicial) | v2 (atual) |
|---|---|---|
| Falsos positivos críticos | 40% | 2% |
| Geocodificações erradas em endereços ambíguos | 70% | 7% |
| Tempo médio resposta IA | 1.8s | 1.2s |
| Custo médio por classificação | $0.004 | $0.002 |

---

> **Lição aprendida:** Prompts de IA em sistemas de segurança **devem falhar explicitamente** em vez de tentar adivinhar. "Não sei" é uma resposta válida e segura.