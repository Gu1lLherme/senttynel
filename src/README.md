# 🛡️ SENTINEL — Proteção Inteligente

Plataforma de segurança pessoal e familiar com **monitoramento em tempo real**, **detecção de quedas via sensores**, **botão de pânico (SOS)**, **cercas geográficas inteligentes** e **controle parental**. Construída sobre a infraestrutura Base44 (React + Deno serverless + IA integrada).

---

## ✨ Funcionalidades principais

- 📍 **Localização em tempo real** com histórico de pings GPS
- 🚨 **SOS / Botão de pânico** com notificação automática de contatos de confiança
- 🛡️ **Cercas geográficas** (safe zones e danger zones) com alertas de entrada/saída
- 👨‍👩‍👧 **Controle parental / familiar** — cônjuges, filhos e parentes idosos
- 📱 **Encontrar dispositivo** — toque alarme, localize, bloqueie
- 💊 **Perfil de saúde** — tipo sanguíneo, alergias, medicações para resgate
- 📊 **Relatórios mensais em PDF** gerados por IA
- 🔔 **Push notifications** via Web Push (VAPID)
- 💳 **Planos de assinatura** integrados ao Stripe

---

## 🧠 Integrações de IA

O SENTINEL utiliza a camada de IA da Base44 (`base44.integrations.Core.InvokeLLM`), que abstrai múltiplos provedores (GPT-4o-mini, Claude, Gemini) com fallback automático.

**Casos de uso de IA:**
1. **Classificação de risco de eventos** — analisa dados de sensores (acelerômetro, GPS, horário) e classifica em níveis `baixo/medio/alto/critico`.
2. **Geração de relatórios mensais** (`functions/generateMonthlyReport.js`) — sumariza atividade, alertas e cercas em PDF.
3. **Geocodificação inteligente** (`functions/geocodeAddress.js`) — endereço livre → coordenadas.

Detalhes completos de prompts em [`docs/PROMPTS.md`](docs/PROMPTS.md).

---

## 🚀 Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + Tailwind + shadcn/ui |
| Roteamento | React Router v6 |
| Estado servidor | TanStack Query (React Query) |
| Mapas | React-Leaflet + OpenStreetMap |
| Backend | Deno serverless (Base44 Functions) |
| Auth & DB | Base44 SDK (`@base44/sdk`) |
| IA | Base44 Core.InvokeLLM (GPT-4o-mini / Claude / Gemini) |
| Pagamentos | Stripe Checkout |
| Push | Web Push API + VAPID |
| PDF | jsPDF |

---

## ⚙️ Configuração de ambiente

### 1. Variáveis de ambiente (Secrets)

Configure no painel da Base44 em **Dashboard → Settings → Environment Variables**:

| Secret | Descrição | Onde obter |
|---|---|---|
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (sk_test_… ou sk_live_…) | https://dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe (pk_test_…) | https://dashboard.stripe.com/apikeys |
| `VAPID_PUBLIC_KEY` | Chave pública Web Push | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Chave privada Web Push | mesma geração acima |
| `VAPID_SUBJECT` | `mailto:seu-email@dominio.com` | seu contato |

> ℹ️ **As chaves de IA NÃO precisam ser configuradas manualmente.** A Base44 gerencia internamente as APIs do GPT-4o-mini / Claude / Gemini via `base44.integrations.Core.InvokeLLM` — basta invocar a função.

### 2. Conector Gmail (notificações por email)

Já autorizado com escopos: `gmail.send`, `email`.
Para reconectar: **Dashboard → Integrations → Gmail → Reconnect**.

---

## 📦 Como recriar o ambiente

### Opção A — Via Base44 (recomendado)
1. Acesse https://base44.com e faça login.
2. **Create new app** → escolha "Import from GitHub".
3. Cole a URL deste repositório.
4. Configure os secrets listados acima.
5. Pronto — a aplicação fica disponível em `https://<seu-app>.base44.app`.

### Opção B — Desenvolvimento local
```bash
git clone <repo-url>
cd sentinel
npm install
npm run dev
```
> ⚠️ Funções serverless (`functions/`) só executam em produção Base44.

---

## 🗂️ Estrutura do projeto

```
sentinel/
├── pages/                    # Telas (BemVindo, Home, Mapa, ControleParental, etc.)
├── components/
│   ├── sentinel/             # Componentes de domínio (LiveMap, SOSButton, ZoneDialog…)
│   ├── familia/              # Componentes de controle parental
│   ├── admin/                # Componentes do dashboard administrativo
│   └── ui/                   # shadcn/ui
├── functions/                # Backend serverless Deno
│   ├── checkGeofence.js
│   ├── sendChildAlert.js
│   ├── generateMonthlyReport.js
│   ├── findDevice.js
│   ├── createCheckoutSession.js
│   ├── sendPushNotification.js
│   ├── geocodeAddress.js
│   └── lookupCEP.js
├── entities/                 # Schemas JSON (Alert, SafeZone, ParentalLink, …)
├── lib/                      # AuthContext, theme, query-client, utils
├── docs/
│   ├── PROMPTS.md            # Documentação dos prompts de IA
│   └── PROMPTS_FAILED.md     # Casos de prompts que falharam
├── public/sw.js              # Service Worker para push
├── App.jsx                   # Router principal
├── index.css                 # Design tokens (Índigo Profundo)
└── tailwind.config.js
```

---

## 🔐 Privacidade por design

- Processamento primário de sensores acontece **no dispositivo**.
- Dados brutos de acelerômetro não trafegam para nuvem — apenas o **score** classificado.
- Localização compartilhada apenas com contatos explicitamente vinculados em `ParentalLink`.
- Push notifications opt-in (VAPID).

---

## 📝 Licença

MIT © Equipe SENTINEL — 2026