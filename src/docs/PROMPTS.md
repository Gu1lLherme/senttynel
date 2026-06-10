# 📚 Documentação de Prompts — SENTINEL

Este documento descreve **todos os prompts de IA** usados no core da aplicação, seus contextos de uso e templates.

> **Plataforma de IA:** Base44 Core (`base44.integrations.Core.InvokeLLM`)
> **Modelos suportados:** GPT-4o-mini (default), Claude Sonnet, Gemini Flash
> **Estratégia:** Saída estruturada em JSON via `response_json_schema` para confiabilidade.

---

## 1️⃣ Classificação de Risco de Evento de Segurança

**Contexto:** Quando o app detecta uma anomalia nos sensores (queda, imobilidade, botão de pânico), envia os dados brutos para a IA classificar a severidade e decidir se aciona contatos de emergência.

**Arquivo:** `functions/classifyRiskEvent.js` (núcleo do agente de segurança)

### Prompt de sistema
```
Você é um agente de segurança pessoal especializado em analisar dados
biométricos e contextuais. Receberá leituras de:
- Acelerômetro (3 eixos, m/s²)
- Giroscópio (3 eixos, rad/s)
- GPS (lat, lng, accuracy, velocidade)
- Hora local do usuário
- Histórico de movimento dos últimos 5 minutos
- Tipo declarado: queda | panico | imobilidade | rota_desviada | manual

Sua tarefa: classificar o evento e atribuir um score de risco de 0 a 100.

Regras de severidade:
- 0-25  → baixo (falso positivo provável)
- 26-50 → médio (perguntar "Está tudo bem?")
- 51-79 → alto (notificar contatos de confiança)
- 80+   → crítico (acionar SOS automático)

NUNCA invente dados. Se inputs forem insuficientes, retorne severity="baixo".
Responda APENAS em JSON válido.
```

### Schema da resposta
```json
{
  "type": "object",
  "properties": {
    "type": { "enum": ["queda", "panico", "imobilidade", "rota_desviada", "manual"] },
    "severity": { "enum": ["baixo", "medio", "alto", "critico"] },
    "risk_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "reasoning": { "type": "string", "maxLength": 280 },
    "recommended_action": { "enum": ["dismiss", "ask_user", "notify_contacts", "trigger_sos"] }
  },
  "required": ["type", "severity", "risk_score", "recommended_action"]
}
```

---

## 2️⃣ Geração de Relatório Mensal de Saúde e Atividade

**Contexto:** Botão "Gerar relatório do mês" na tela `CriancaDetalhe` produz um PDF resumindo a atividade do familiar monitorado.

**Arquivo:** `functions/generateMonthlyReport.js`

### Prompt
```
Você é um redator técnico de relatórios de saúde e segurança familiar.

Receberá dados estruturados do mês de {{MONTH}}/{{YEAR}} para {{CHILD_NAME}}:
- Total de pings GPS: {{PINGS}}
- Alertas recebidos: {{ALERTS_JSON}}
- Eventos de cerca geográfica: {{GEOFENCE_EVENTS_JSON}}
- Bateria média do dispositivo: {{AVG_BATTERY}}%

Produza um relatório em português brasileiro contendo:
1. **Resumo executivo** (2-3 frases)
2. **Eventos relevantes** (lista cronológica, máx 10)
3. **Padrões identificados** (rotina, horários frequentes em zonas seguras)
4. **Pontos de atenção** (alertas críticos, baterias baixas, saídas inesperadas)
5. **Recomendações** (máx 3)

Tom: profissional, empático, sem alarmismo. Não invente eventos.
```

### Schema da resposta
```json
{
  "type": "object",
  "properties": {
    "summary": { "type": "string" },
    "events": { "type": "array", "items": { "type": "object" } },
    "patterns": { "type": "array", "items": { "type": "string" } },
    "attention_points": { "type": "array", "items": { "type": "string" } },
    "recommendations": { "type": "array", "items": { "type": "string" } }
  }
}
```

---

## 3️⃣ Geocodificação Inteligente de Endereço

**Contexto:** Usuário digita endereço em texto livre ao criar uma `SafeZone`. A IA com `add_context_from_internet=true` resolve para lat/lng.

**Arquivo:** `functions/geocodeAddress.js`

### Prompt
```
Converta o seguinte endereço em coordenadas geográficas precisas (Brasil):

"{{ADDRESS}}"

Use seu conhecimento de mapas e contexto da internet para encontrar a
localização exata. Se houver ambiguidade, escolha a interpretação mais
provável para o Brasil. Se impossível resolver, retorne success=false.
```

### Schema da resposta
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "lat": { "type": "number" },
    "lng": { "type": "number" },
    "formatted_address": { "type": "string" },
    "confidence": { "enum": ["high", "medium", "low"] }
  },
  "required": ["success"]
}
```

---

## 4️⃣ Análise de Mensagem do Usuário no Botão "Está tudo bem?"

**Contexto:** Após detecção de queda média, app pergunta "Está tudo bem?". Usuário pode responder em texto livre por voz/digitação. IA interpreta intenção.

### Prompt
```
Interprete a resposta do usuário a "Está tudo bem?" após detecção de queda.

Resposta: "{{USER_REPLY}}"

Classifique a intenção em:
- "all_good"        → confirma que está bem (cancelar alerta)
- "needs_help"      → pede ajuda (acionar SOS)
- "false_positive"  → diz que não caiu (registrar falso positivo)
- "unclear"         → ambíguo (manter alerta ativo)

Considere variações regionais, gírias, respostas curtas ("tô bem", "ok",
"socorro", "tá tudo certo", "me ajuda").
```

---

## 🛡️ Boas práticas adotadas

| Prática | Implementação |
|---|---|
| **Saída estruturada** | Sempre via `response_json_schema` — nunca parse de texto livre |
| **Limitação de tokens** | Prompts curtos, `maxLength` em campos descritivos |
| **Anti-alucinação** | Instruções explícitas "NUNCA invente dados" |
| **Fallback seguro** | Se IA falha → severity="baixo" / success=false |
| **Privacidade** | Dados brutos de sensor NÃO enviados — apenas estatísticas agregadas |
| **Modelo econômico** | GPT-4o-mini default; só upgrade para tarefas críticas |
| **Versionamento** | Cada prompt tem versão registrada (ver histórico Git) |

---

## 📌 Versionamento de prompts

Toda alteração de prompt deve:
1. Ser feita neste arquivo (`docs/PROMPTS.md`).
2. Gerar commit no GitHub com mensagem `prompt(<função>): <descrição>`.
3. Ser testada com 5+ inputs reais antes do merge.

Histórico completo: `git log -- docs/PROMPTS.md