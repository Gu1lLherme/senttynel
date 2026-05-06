# SENTINEL — Memória de Produto

> Sistema de segurança em tempo real para o usuário e sua família. O smartphone funciona como um "segurança pessoal" que monitora, decide e age em momentos de necessidade.

---

## 🎯 Visão central

O SENTINEL transforma o smartphone em um agente de proteção que:
- Monitora continuamente o usuário através dos sensores nativos do aparelho.
- Toma decisões automáticas com base em padrões e contexto.
- Aciona a rede de proteção (família, contatos de confiança) sem depender de ação manual da vítima.
- Centraliza informações críticas para situações de resgate.

**Promessa:** "Em momento de necessidade, você não precisa pedir ajuda — o SENTINEL pede por você."

---

## 📱 Plataforma alvo

- **Atual:** Web App (React + Tailwind) sobre Base44.
- **Próximo passo:** Conversão para **React Native** mantendo a mesma stack visual.
- Motivo: acesso nativo aos sensores (acelerômetro, giroscópio, GPS de alta precisão, microfone, câmera, biometria) e push notifications confiáveis.

---

## 🤖 Agente de IA — Níveis de Estado

O agente analisa as métricas dos sensores em tempo real e classifica o usuário em um dos 4 estados:

| Nível | Cor | Gatilhos | Ação automática |
|---|---|---|---|
| **🟢 SEGURO** | Verde | Dentro de SafeZone, movimento normal, bateria OK | Nenhuma — apenas registra ping |
| **🟡 SAINDO DA ZONA** | Amarelo | GPS cruzou borda de cerca, rota fora do esperado | Notifica responsáveis (push + email) |
| **🟠 SUSPEITO** | Laranja | Imobilidade prolongada, padrão atípico, bateria crítica em local desconhecido, desvio de rota acumulado | Pergunta "Está tudo bem?" no app, pré-alerta aos contatos |
| **🔴 PERIGO** | Vermelho | Queda detectada (acelerômetro), botão pânico, ausência de resposta ao "Está tudo bem?", padrões de violência | SOS automático: notifica todos os contatos, envia localização, aciona emergência |

### Sensores e métricas mapeadas

- **GPS / Localização** → cercas, rotas, velocidade de deslocamento
- **Acelerômetro** → quedas, impactos, padrão de caminhada
- **Giroscópio** → orientação do aparelho (deitado prolongado = imobilidade)
- **Bateria** → contexto de risco (bateria crítica em local desconhecido)
- **Microfone (opcional, com consentimento)** → detecção de gritos/sons de pânico
- **Biometria** → confirmação de "está tudo bem"
- **Conectividade** → se sair do ar de forma anômala, alerta os pais

### Pipeline de decisão

```
Sensores → LocationPing/SensorReading (entidade)
        ↓
Automação (entity create) → função analyzeRiskLevel
        ↓
Agente IA (InvokeLLM) classifica → atualiza UserState entity
        ↓
Se mudou de nível → dispara push + email aos contatos
```

---

## 🗺️ Funcionalidades implementadas

- ✅ Login/cadastro com fluxo próprio
- ✅ Mapa em tempo real (Leaflet + GPS)
- ✅ Cercas geográficas (SafeZone) com geocoding automático
- ✅ Botão de pânico SOS
- ✅ Controle parental — vincular crianças
- ✅ Notificações por email (Gmail) para entrada/saída de cercas
- ✅ Dashboard administrativo com métricas
- ✅ Relatório PDF mensal
- ✅ Histórico de alertas

## 🚧 Funcionalidades em desenvolvimento

- 🔨 **Encontrar Smartphone** — pais/parceiros podem fazer o smartphone tocar remotamente, ver última localização e bloqueá-lo
- 🔨 **Push Notifications** — alertas instantâneos na tela de bloqueio (Web Push API agora; FCM quando migrar para React Native)
- 🔨 **Perfil de Saúde da Criança** — tipo sanguíneo, alergias, medicações, foto, contatos de emergência secundários
- 🔨 **Agente de IA classificador** — decide nível Seguro/Saindo/Suspeito/Perigo

## 🎯 Roadmap futuro

- Detecção de queda via acelerômetro (React Native)
- Detecção de imobilidade prolongada
- Modo viagem (rotas pré-aprovadas)
- Integração com emergência 190/192/193 (Brasil)
- Wearables (Apple Watch / Wear OS) para SOS discreto
- Gravação de áudio circular (últimos 30s) em caso de pânico
- QR Code de emergência na tela de bloqueio com dados de saúde
- Modo "voltando para casa" com timer e check-in automático

---

## 🔐 Princípios de privacidade

1. **Privacidade por design** — processamento primário no dispositivo
2. **Transparência total** — a criança sempre vê o que está sendo compartilhado
3. **Consentimento granular** — cada permissão (localização, bateria, alertas, áudio) é opt-in independente
4. **Dados de saúde criptografados** — apenas o vínculo familiar ativo enxerga
5. **Retenção mínima** — pings antigos são purgados automaticamente

---

## 🎨 Identidade visual

- Cores: Azul SENTINEL (#1d4ed8) + Vermelho urgência (#dc2626)
- Tipografia: Inter (300-900)
- Estética: glass-cards, blur, gradientes suaves
- Tom: profissional, confiável, calmo — não alarmista