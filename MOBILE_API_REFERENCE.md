# 📱 Sanctum Mobile App - API Reference Completa

**Versão:** 1.0.0  
**Data:** 2026-04-10  
**Status:** ✅ Em Produção

---

## 📋 Índice

1. [Configuração Base](#configuração-base)
2. [Autenticação](#autenticação)
3. [Módulo de Autenticação](#módulo-de-autenticação)
4. [Módulo de Usuários](#módulo-de-usuários)
5. [Módulo de Bíblia](#módulo-de-bíblia)
6. [Módulo de Liturgia](#módulo-de-liturgia)
7. [Módulo de Rosário](#módulo-de-rosário)
8. [Módulo de Gamificação](#módulo-de-gamificação)
9. [Módulo de Comunidade](#módulo-de-comunidade)
10. [Módulo de Personalização](#módulo-de-personalização)
11. [Módulo de Conteúdo](#módulo-de-conteúdo)
12. [Módulo de Campanhas](#módulo-de-campanhas)
13. [Módulo de Grupos](#módulo-de-grupos)
14. [Módulo de Rotinas](#módulo-de-rotinas)
15. [Módulo de Lembretes](#módulo-de-lembretes)
16. [Códigos de Erro](#códigos-de-erro)

---

## 🔧 Configuração Base

### URL Base da API
```
https://api.sanctum.app/api/v1
```

Para desenvolvimento local:
```
http://localhost:3000/api/v1
```

### Headers Padrão
Todas as requisições devem incluir:
```http
Content-Type: application/json
Accept: application/json
```

### Headers com Autenticação
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Rate Limiting
- **Limite:** 100 requisições por minuto por IP
- **Header de resposta:** `X-RateLimit-Remaining`
- **Erro:** 429 Too Many Requests

---

## 🔐 Autenticação

### Tipos de Autenticação

#### JWT (JSON Web Token)
- **Tipo:** Bearer Token
- **Local de Armazenamento:** Secure Storage (Keychain/Keystore)
- **Duração:** 15 minutos
- **Atualização:** Via Refresh Token

#### Refresh Token
- **Duração:** 7 dias
- **Armazenamento:** Secure Storage
- **Uso:** Obter novo Access Token sem re-login

### Fluxo de Autenticação

```
1. Usuário insere credenciais
   ↓
2. POST /auth/register ou POST /auth/login
   ↓
3. Servidor retorna accessToken + refreshToken
   ↓
4. App armazena tokens em Secure Storage
   ↓
5. Usa accessToken em todas as requisições
   ↓
6. Se expirado → POST /auth/refresh com refreshToken
```

### Tratamento de Token Expirado
```javascript
// No interceptor HTTP:
if (error.status === 401) {
  // 1. Tenta renovar com refreshToken
  // 2. Se sucesso: reenviar requisição original
  // 3. Se falha: redirecionar para login
}
```

---

## 🔑 Módulo de Autenticação

### 1. Registrar Novo Usuário

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "SenhaSegura123!",
  "name": "Nome do Usuário"
}
```

**Response 201 (Sucesso):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123abc",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "avatar": null,
    "isAdmin": false,
    "createdAt": "2026-04-10T09:30:00Z",
    "onboardingCompleted": false
  }
}
```

**Response 400 (Validação):**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password is too weak"
  ]
}
```

**Response 409 (Conflito - Email já existe):**
```json
{
  "statusCode": 409,
  "message": "Email already registered"
}
```

---

### 2. Login de Usuário

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "SenhaSegura123!"
}
```

**Response 200 (Sucesso):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123abc",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "avatar": "https://...",
    "isAdmin": false,
    "createdAt": "2026-04-10T09:30:00Z",
    "onboardingCompleted": true
  }
}
```

**Response 401 (Não autorizado):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### 3. Renovar Token de Acesso

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200 (Sucesso):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401 (Token inválido/expirado):**
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token"
}
```

---

### 4. Logout do Usuário

**Endpoint:** `POST /auth/logout`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Logout successful"
}
```

---

### 5. Completar Onboarding

**Endpoint:** `POST /auth/onboarding`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "focusArea": "PEACE",
  "sessionLength": "MEDIUM",
  "preferredFormat": "MIXED",
  "experienceLevel": "BEGINNER",
  "interests": [
    "BIBLE",
    "PRAYER",
    "MEDITATION"
  ]
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Onboarding completed",
  "profile": {
    "id": "pref_123abc",
    "userId": "user_123abc",
    "focusArea": "PEACE",
    "sessionLength": "MEDIUM",
    "preferredFormat": "MIXED",
    "experienceLevel": "BEGINNER",
    "notifyMorning": true,
    "notifyNight": true,
    "timezone": "America/Sao_Paulo"
  }
}
```

**Valores Aceitos:**

| Campo | Opções |
|-------|--------|
| focusArea | `PEACE`, `GROWTH`, `HEALING`, `STRENGTH`, `JOY` |
| sessionLength | `SHORT` (5-10 min), `MEDIUM` (15-20 min), `LONG` (30+ min) |
| preferredFormat | `BIBLE`, `PRAYER`, `MEDITATION`, `MIXED` |
| experienceLevel | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| interests | Array de: `BIBLE`, `PRAYER`, `LITURGY`, `ROSARY`, `MEDITATION`, `COMMUNITY` |

---

### 6. Obter Perfil do Usuário

**Endpoint:** `GET /auth/me`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "id": "user_123abc",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "avatar": "https://...",
  "isAdmin": false,
  "onboardingCompleted": true,
  "createdAt": "2026-04-10T09:30:00Z",
  "stats": {
    "totalXP": 1250,
    "level": 5,
    "totalLiturgyRead": 15,
    "totalContemplated": 8,
    "totalBibleChapters": 22,
    "totalRosaries": 5
  }
}
```

---

## 👤 Módulo de Usuários

### 1. Obter Perfil Detalhado

**Endpoint:** `GET /users/me`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "user_123abc",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "avatar": "https://...",
  "parishId": null,
  "isAdmin": false,
  "onboardingCompleted": true,
  "createdAt": "2026-04-10T09:30:00Z",
  "updatedAt": "2026-04-10T10:15:00Z"
}
```

---

### 2. Atualizar Perfil

**Endpoint:** `PATCH /users/me`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body (todos opcionais):**
```json
{
  "name": "Novo Nome",
  "avatar": "https://url-da-imagem.com/foto.jpg",
  "parishId": "parish_123"
}
```

**Response 200 (Sucesso):**
```json
{
  "id": "user_123abc",
  "email": "usuario@exemplo.com",
  "name": "Novo Nome",
  "avatar": "https://url-da-imagem.com/foto.jpg",
  "updatedAt": "2026-04-10T10:15:00Z"
}
```

---

### 3. Obter Estatísticas do Usuário

**Endpoint:** `GET /users/me/stats`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "stats_123abc",
  "userId": "user_123abc",
  "xp": 1250,
  "level": 5,
  "totalLiturgyRead": 15,
  "totalContemplated": 8,
  "totalBibleChapters": 22,
  "totalRosaries": 5,
  "updatedAt": "2026-04-10T10:15:00Z"
}
```

---

### 4. Obter Badges do Usuário

**Endpoint:** `GET /users/me/badges`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "badges": [
    {
      "id": "badge_001",
      "name": "Primeiro Capítulo",
      "description": "Leia seu primeiro capítulo da Bíblia",
      "icon": "https://...",
      "earnedAt": "2026-04-09T15:30:00Z"
    },
    {
      "id": "badge_002",
      "name": "Streak de 7 Dias",
      "description": "Mantenha uma sequência de 7 dias",
      "icon": "https://...",
      "earnedAt": "2026-04-10T09:30:00Z"
    }
  ],
  "totalBadges": 2
}
```

---

### 5. Obter Atividades Recentes

**Endpoint:** `GET /users/me/activity`

**Query Parameters:**
```
?limit=20&offset=0
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "activities": [
    {
      "id": "activity_123",
      "type": "BIBLE_READ",
      "description": "Leu Gênesis 1:1-5",
      "xpGained": 10,
      "createdAt": "2026-04-10T10:15:00Z"
    },
    {
      "id": "activity_124",
      "type": "ROSARY_COMPLETE",
      "description": "Completou um terço",
      "xpGained": 25,
      "createdAt": "2026-04-10T09:45:00Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

---

### 6. Obter Resumo de Hoje

**Endpoint:** `GET /users/me/today`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "date": "2026-04-10",
  "xpGainedToday": 85,
  "activitiesCount": 5,
  "liturgyCompleted": true,
  "bibleChaptersRead": 2,
  "rosariesCompleted": 1,
  "streakContinued": true,
  "nextReminder": "2026-04-10T20:00:00Z"
}
```

---

## 📖 Módulo de Bíblia

### 1. Listar Todos os Livros

**Endpoint:** `GET /bible/books`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "books": [
    {
      "id": "GEN",
      "name": "Gênesis",
      "abbreviation": "Gn",
      "chapters": 50,
      "testament": "OLD",
      "order": 1
    },
    {
      "id": "EXO",
      "name": "Êxodo",
      "abbreviation": "Ex",
      "chapters": 40,
      "testament": "OLD",
      "order": 2
    }
    // ... mais livros
  ],
  "totalBooks": 73
}
```

---

### 2. Obter Capítulos de um Livro

**Endpoint:** `GET /bible/books/{bookId}/chapters`

**Path Parameters:**
```
bookId = "GEN" (ID do livro)
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "bookId": "GEN",
  "bookName": "Gênesis",
  "chapters": [
    {
      "num": 1,
      "verses": 31,
      "isRead": false,
      "isContemplated": false,
      "lastReadAt": null
    },
    {
      "num": 2,
      "verses": 25,
      "isRead": true,
      "isContemplated": false,
      "lastReadAt": "2026-04-09T14:30:00Z"
    }
    // ... mais capítulos
  ],
  "totalChapters": 50
}
```

---

### 3. Obter Conteúdo de um Capítulo

**Endpoint:** `GET /bible/books/{bookId}/chapters/{num}`

**Path Parameters:**
```
bookId = "GEN"
num = 1
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "bookId": "GEN",
  "bookName": "Gênesis",
  "chapter": 1,
  "verses": [
    {
      "verse": 1,
      "text": "No princípio, criou Deus os céus e a terra."
    },
    {
      "verse": 2,
      "text": "A terra era sem forma e vazia..."
    }
    // ... mais versículos
  ],
  "totalVerses": 31,
  "userProgress": {
    "isRead": false,
    "isContemplated": false,
    "savedVerses": []
  }
}
```

---

### 4. Registrar Leitura de Capítulo

**Endpoint:** `POST /bible/progress`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "bookId": "GEN",
  "chapterNum": 1,
  "contemplated": false
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "progress_123",
  "bookId": "GEN",
  "chapterNum": 1,
  "contemplated": false,
  "xpGained": 10,
  "message": "Capítulo registrado com sucesso!"
}
```

---

### 5. Obter Progresso de Leitura

**Endpoint:** `GET /bible/progress`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "totalChaptersRead": 22,
  "totalChaptersContemplated": 5,
  "books": [
    {
      "bookId": "GEN",
      "name": "Gênesis",
      "chaptersRead": 5,
      "chaptersContemplated": 2,
      "percentComplete": 10
    },
    {
      "bookId": "EXO",
      "name": "Êxodo",
      "chaptersRead": 3,
      "chaptersContemplated": 1,
      "percentComplete": 7.5
    }
  ],
  "overallProgress": 1.5
}
```

---

### 6. Salvar Versículo

**Endpoint:** `POST /bible/saved-passages`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "bookId": "GEN",
  "chapterNum": 1,
  "verseStart": 1,
  "verseEnd": 5,
  "text": "No princípio, criou Deus...",
  "notes": "Versículo importante sobre a criação"
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "passage_123abc",
  "bookId": "GEN",
  "chapterNum": 1,
  "verseStart": 1,
  "verseEnd": 5,
  "text": "No princípio, criou Deus...",
  "notes": "Versículo importante sobre a criação",
  "savedAt": "2026-04-10T10:15:00Z"
}
```

---

### 7. Listar Versículos Salvos

**Endpoint:** `GET /bible/saved-passages`

**Query Parameters:**
```
?limit=20&offset=0&bookId=GEN
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "passages": [
    {
      "id": "passage_123abc",
      "bookId": "GEN",
      "bookName": "Gênesis",
      "chapterNum": 1,
      "verseStart": 1,
      "verseEnd": 5,
      "text": "No princípio, criou Deus...",
      "notes": "Versículo importante",
      "savedAt": "2026-04-10T10:15:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

### 8. Deletar Versículo Salvo

**Endpoint:** `DELETE /bible/saved-passages/{id}`

**Path Parameters:**
```
id = "passage_123abc"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Passage deleted successfully"
}
```

---

## ⛪ Módulo de Liturgia

### 1. Obter Liturgia de Hoje

**Endpoint:** `GET /liturgy/today`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "liturgy_2026_04_10",
  "date": "2026-04-10",
  "gospel": "Jo 20:19-31",
  "gospelText": "Naquele primeiro dia da semana...",
  "reflection": "Texto completo da reflexão diária...",
  "homily": "Reflexão sobre o evangelho de hoje...",
  "homilyAudioUrl": "https://...",
  "firstReading": "At 4:32-35",
  "firstReadingText": "A multidão dos que tinham abraçado...",
  "firstReadingReference": "At 4:32-35",
  "secondReading": "1Jo 1:1-2:2",
  "secondReadingText": "O que era desde o princípio...",
  "secondReadingReference": "1Jo 1:1-2:2",
  "psalm": "Sl 117",
  "psalmText": "Aleluia! Louvai ao Senhor...",
  "psalmReference": "Sl 117",
  "liturgicalSeason": "EASTER",
  "source": "cancaonova",
  "userCompletion": {
    "completed": false,
    "completedAt": null
  }
}
```

---

### 2. Marcar Liturgia como Completada

**Endpoint:** `POST /liturgy/complete`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "date": "2026-04-10",
  "contemplated": true
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "completion_123",
  "date": "2026-04-10",
  "completed": true,
  "contemplated": true,
  "xpGained": 20,
  "message": "Liturgia marcada como completa!"
}
```

---

### 3. Obter Status de Conclusão

**Endpoint:** `GET /liturgy/today/completion`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "completed": true,
  "completedAt": "2026-04-10T15:30:00Z",
  "contemplated": true,
  "xpGained": 20
}
```

---

### 4. Sincronizar Liturgia (Debug)

**Endpoint:** `POST /liturgy/sync`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "message": "Liturgy synced successfully",
  "synced": 1
}
```

---

## 📿 Módulo de Rosário

### 1. Obter Rosário de Hoje

**Endpoint:** `GET /rosary/today`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "rosary_2026_04_10",
  "date": "2026-04-10",
  "mysteries": "LUMINOUS",
  "mysteriesName": "Mistérios Luminosos",
  "dayOfWeek": "THURSDAY",
  "details": {
    "mystery1": "O Batismo de Jesus",
    "mystery2": "A Automanifestação de Jesus nas Bodas de Caná",
    "mystery3": "O Anúncio do Reino de Deus",
    "mystery4": "A Transfiguração",
    "mystery5": "A Instituição da Eucaristia"
  },
  "userCompletion": {
    "completed": false,
    "completedAt": null
  }
}
```

---

### 2. Marcar Rosário como Completado

**Endpoint:** `POST /rosary/complete`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "date": "2026-04-10"
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "rosary_completion_123",
  "date": "2026-04-10",
  "completed": true,
  "xpGained": 25,
  "message": "Rosário completado com sucesso!"
}
```

---

## 🎮 Módulo de Gamificação

### 1. Obter Streak Atual

**Endpoint:** `GET /streak/me`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "streak_123abc",
  "userId": "user_123abc",
  "currentStreak": 12,
  "longestStreak": 25,
  "shields": 1,
  "lastActivityAt": "2026-04-10T15:30:00Z",
  "nextCheckInAt": "2026-04-11T00:00:00Z"
}
```

---

### 2. Fazer Check-In no Streak

**Endpoint:** `POST /streak/check-in`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "currentStreak": 13,
  "xpGained": 5,
  "message": "Check-in realizado! Streak mantido!",
  "nextCheckIn": "2026-04-11T00:00:00Z"
}
```

**Response 200 (Streak Recuperado com Escudo):**
```json
{
  "currentStreak": 13,
  "shields": 0,
  "message": "Streak recuperado com escudo!",
  "xpGained": 0
}
```

---

### 3. Usar Escudo

**Endpoint:** `POST /streak/use-shield`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Shield activated! Your streak is protected.",
  "shields": 0,
  "nextCheckIn": "2026-04-11T00:00:00Z"
}
```

**Response 400 (Sem escudos):**
```json
{
  "statusCode": 400,
  "message": "No shields available"
}
```

---

### 4. Ranking de Streaks

**Endpoint:** `GET /streak/ranking`

**Query Parameters:**
```
?limit=10&timeframe=monthly
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "ranking": [
    {
      "position": 1,
      "userId": "user_456",
      "userName": "João Silva",
      "avatar": "https://...",
      "streak": 45,
      "xpGained": 2150
    },
    {
      "position": 2,
      "userId": "user_123abc",
      "userName": "Seu Nome",
      "avatar": "https://...",
      "streak": 12,
      "xpGained": 850
    }
  ],
  "yourPosition": 2,
  "timeframe": "monthly"
}
```

---

### 5. Obter Desafios Semanais

**Endpoint:** `GET /challenges/weekly`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "weekStartDate": "2026-04-07",
  "weekEndDate": "2026-04-13",
  "challenges": [
    {
      "id": "challenge_001",
      "title": "Leia 5 Capítulos",
      "description": "Leia 5 capítulos da Bíblia durante esta semana",
      "type": "BIBLE_CHAPTER",
      "goal": 5,
      "progress": 2,
      "reward": 50,
      "completed": false
    },
    {
      "id": "challenge_002",
      "title": "Mantenha o Streak",
      "description": "Realize check-in todos os dias",
      "type": "STREAK_CHECKIN",
      "goal": 7,
      "progress": 5,
      "reward": 35,
      "completed": false
    },
    {
      "id": "challenge_003",
      "title": "Reze o Rosário",
      "description": "Complete 2 rosários",
      "type": "ROSARY_COMPLETE",
      "goal": 2,
      "progress": 1,
      "reward": 40,
      "completed": false
    }
  ],
  "totalRewardPossible": 125
}
```

---

## 👥 Módulo de Comunidade

### 1. Listar Pedidos de Oração

**Endpoint:** `GET /community/prayers`

**Query Parameters:**
```
?limit=20&offset=0&sort=recent
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "prayers": [
    {
      "id": "prayer_123",
      "content": "Oração pela saúde da minha avó",
      "isAnonymous": false,
      "userId": "user_456",
      "userName": "Maria Silva",
      "prayerCount": 45,
      "reportCount": 0,
      "isHidden": false,
      "createdAt": "2026-04-10T08:30:00Z",
      "userHasPrayed": false
    },
    {
      "id": "prayer_124",
      "content": "Agradeço pela resposta às minhas orações",
      "isAnonymous": true,
      "prayerCount": 32,
      "reportCount": 0,
      "isHidden": false,
      "createdAt": "2026-04-10T09:15:00Z",
      "userHasPrayed": true
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Criar Pedido de Oração

**Endpoint:** `POST /community/prayers`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "content": "Oração por paz no mundo",
  "isAnonymous": false
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "prayer_125",
  "content": "Oração por paz no mundo",
  "isAnonymous": false,
  "userId": "user_123abc",
  "prayerCount": 0,
  "reportCount": 0,
  "isHidden": false,
  "xpGained": 5,
  "createdAt": "2026-04-10T10:15:00Z"
}
```

**Response 400 (Validação):**
```json
{
  "statusCode": 400,
  "message": "Content is required and must be between 10 and 500 characters"
}
```

---

### 3. Rezar por um Pedido

**Endpoint:** `POST /community/prayers/{id}/pray`

**Path Parameters:**
```
id = "prayer_123"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "prayerCount": 46,
  "userHasPrayed": true,
  "xpGained": 2,
  "message": "Oração registrada com sucesso!"
}
```

---

### 4. Denunciar Pedido de Oração

**Endpoint:** `POST /community/prayers/{id}/report`

**Path Parameters:**
```
id = "prayer_123"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "reason": "INAPPROPRIATE_CONTENT"
}
```

**Response 201 (Sucesso):**
```json
{
  "message": "Report submitted successfully",
  "reportId": "report_123abc"
}
```

**Razões Aceitas:**
- `INAPPROPRIATE_CONTENT`
- `SPAM`
- `HARASSMENT`
- `FALSE_INFORMATION`

---

## 🎯 Módulo de Personalização

### 1. Obter Perfil de Preferências

**Endpoint:** `GET /personalization/profile`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "profile_123abc",
  "userId": "user_123abc",
  "preferredFormat": "MIXED",
  "sessionLength": "MEDIUM",
  "focusArea": "PEACE",
  "experienceLevel": "INTERMEDIATE",
  "notifyMorning": true,
  "notifyNight": true,
  "timezone": "America/Sao_Paulo",
  "createdAt": "2026-04-10T09:30:00Z",
  "updatedAt": "2026-04-10T10:15:00Z"
}
```

---

### 2. Atualizar Perfil de Preferências

**Endpoint:** `PATCH /personalization/profile`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body (todos opcionais):**
```json
{
  "preferredFormat": "BIBLE",
  "sessionLength": "LONG",
  "focusArea": "HEALING",
  "notifyMorning": false,
  "notifyNight": true,
  "timezone": "America/Sao_Paulo"
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "profile_123abc",
    "preferredFormat": "BIBLE",
    "sessionLength": "LONG",
    "focusArea": "HEALING",
    "notifyMorning": false,
    "notifyNight": true,
    "updatedAt": "2026-04-10T10:15:00Z"
  }
}
```

---

### 3. Criar Perfil de Preferências

**Endpoint:** `POST /personalization/profile`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "preferredFormat": "MIXED",
  "sessionLength": "MEDIUM",
  "focusArea": "PEACE",
  "experienceLevel": "BEGINNER",
  "timezone": "America/Sao_Paulo"
}
```

**Response 201 (Criado):**
```json
{
  "id": "profile_123abc",
  "userId": "user_123abc",
  "preferredFormat": "MIXED",
  "sessionLength": "MEDIUM",
  "focusArea": "PEACE",
  "experienceLevel": "BEGINNER",
  "notifyMorning": true,
  "notifyNight": true,
  "timezone": "America/Sao_Paulo",
  "createdAt": "2026-04-10T10:15:00Z"
}
```

---

### 4. Obter Interesses do Usuário

**Endpoint:** `GET /personalization/interests`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "interests": [
    {
      "id": "interest_001",
      "key": "BIBLE",
      "name": "Bíblia",
      "description": "Leitura e meditação bíblica"
    },
    {
      "id": "interest_002",
      "key": "PRAYER",
      "name": "Oração",
      "description": "Guias de oração e meditação"
    },
    {
      "id": "interest_003",
      "key": "MEDITATION",
      "name": "Meditação",
      "description": "Exercícios de meditação espiritual"
    }
  ]
}
```

---

### 5. Atualizar Interesses

**Endpoint:** `PATCH /personalization/interests`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "interests": ["BIBLE", "PRAYER", "ROSARY", "MEDITATION"]
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Interests updated successfully",
  "interests": ["BIBLE", "PRAYER", "ROSARY", "MEDITATION"]
}
```

---

### 6. Obter Recomendações

**Endpoint:** `GET /personalization/recommendations`

**Query Parameters:**
```
?limit=10
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "recommendations": [
    {
      "id": "rec_123",
      "type": "BIBLE_PASSAGE",
      "title": "Gênesis 1:1-5",
      "description": "Sobre a criação",
      "targetId": "GEN-1",
      "reason": "Baseado em seus interesses",
      "score": 0.95,
      "generatedAt": "2026-04-10T08:00:00Z"
    },
    {
      "id": "rec_124",
      "type": "MEDITATION",
      "title": "Meditação da Paz",
      "description": "Uma meditação de 10 minutos",
      "targetId": "med_001",
      "reason": "Complementa seu foco atual",
      "score": 0.87,
      "generatedAt": "2026-04-10T08:00:00Z"
    }
  ],
  "generatedAt": "2026-04-10T08:00:00Z"
}
```

---

### 7. Obter Próxima Ação Recomendada

**Endpoint:** `GET /personalization/recommendations/next-action`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "rec_123",
  "type": "BIBLE_PASSAGE",
  "title": "Leia Gênesis 1:1-5",
  "description": "Baseado em seus interesses e progresso",
  "targetId": "GEN-1",
  "action": "READ_BIBLE",
  "estimatedTime": 5,
  "reason": "Continua sua leitura bíblica"
}
```

---

### 8. Consumir Recomendação

**Endpoint:** `POST /personalization/recommendations/{id}/consume`

**Path Parameters:**
```
id = "rec_123"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Recommendation consumed successfully",
  "xpGained": 5,
  "consumedAt": "2026-04-10T10:15:00Z"
}
```

---

### 9. Atualizar Recomendações

**Endpoint:** `POST /personalization/recommendations/refresh`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Recommendations refreshed successfully",
  "refreshedAt": "2026-04-10T10:15:00Z"
}
```

---

## 📚 Módulo de Conteúdo

### 1. Listar Conteúdo em Destaque

**Endpoint:** `GET /content/featured`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "featured": [
    {
      "id": "content_001",
      "title": "Série: Encontro com Deus",
      "description": "Uma série de 7 dias de meditações",
      "type": "SERIES",
      "thumbnail": "https://...",
      "duration": 45,
      "sessionsCount": 7,
      "completed": false,
      "progress": 0
    }
  ]
}
```

---

### 2. Listar Séries de Conteúdo

**Endpoint:** `GET /content/series`

**Query Parameters:**
```
?limit=20&offset=0&filter=MEDITATION
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "series": [
    {
      "id": "series_001",
      "title": "Série: Encontro com Deus",
      "slug": "encontro-com-deus",
      "description": "Uma série de 7 dias de meditações",
      "thumbnail": "https://...",
      "sessionsCount": 7,
      "estimatedDuration": 45,
      "difficulty": "BEGINNER",
      "category": "MEDITATION",
      "enrolledCount": 234,
      "rating": 4.8,
      "userEnrolled": false
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

### 3. Obter Detalhes de uma Série

**Endpoint:** `GET /content/series/{slug}`

**Path Parameters:**
```
slug = "encontro-com-deus"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "series_001",
  "title": "Série: Encontro com Deus",
  "slug": "encontro-com-deus",
  "description": "Uma série de 7 dias de meditações guiadas",
  "thumbnail": "https://...",
  "category": "MEDITATION",
  "difficulty": "BEGINNER",
  "estimatedDuration": 45,
  "rating": 4.8,
  "enrolledCount": 234,
  "sessions": [
    {
      "id": "session_001",
      "title": "Dia 1: O Silêncio",
      "duration": 6,
      "description": "Inicie seu encontro com Deus no silêncio",
      "order": 1,
      "completed": false
    },
    {
      "id": "session_002",
      "title": "Dia 2: A Escuta",
      "duration": 7,
      "description": "Aprenda a escutar a voz de Deus",
      "order": 2,
      "completed": false
    }
  ],
  "userEnrolled": false,
  "userProgress": 0
}
```

---

### 4. Iniciar uma Série

**Endpoint:** `POST /content/series/{id}/start`

**Path Parameters:**
```
id = "series_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "id": "enrollment_123",
  "userId": "user_123abc",
  "seriesId": "series_001",
  "startedAt": "2026-04-10T10:15:00Z",
  "progress": 0,
  "message": "Series started successfully!"
}
```

---

### 5. Obter Conteúdo de uma Sessão

**Endpoint:** `GET /content/sessions/{id}`

**Path Parameters:**
```
id = "session_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "session_001",
  "seriesId": "series_001",
  "title": "Dia 1: O Silêncio",
  "description": "Inicie seu encontro com Deus no silêncio",
  "duration": 6,
  "content": "Conteúdo completo da sessão em HTML ou markdown",
  "audioUrl": "https://...",
  "videoUrl": "https://...",
  "userProgress": {
    "completed": false,
    "completedAt": null,
    "xpGained": 0
  }
}
```

---

### 6. Completar Sessão

**Endpoint:** `POST /content/sessions/{id}/complete`

**Path Parameters:**
```
id = "session_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "message": "Session completed successfully!",
  "xpGained": 15,
  "nextSession": {
    "id": "session_002",
    "title": "Dia 2: A Escuta"
  }
}
```

---

### 7. Buscar Conteúdo

**Endpoint:** `GET /content/search`

**Query Parameters:**
```
?q=meditacao&limit=20&offset=0
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "results": [
    {
      "id": "series_001",
      "type": "SERIES",
      "title": "Série: Encontro com Deus",
      "description": "Uma série de meditações...",
      "thumbnail": "https://..."
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### 8. Obter Progresso de Conteúdo

**Endpoint:** `GET /content/progress`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "totalSeriesStarted": 3,
  "totalSeriesCompleted": 1,
  "totalSessionsCompleted": 12,
  "series": [
    {
      "seriesId": "series_001",
      "title": "Série: Encontro com Deus",
      "sessionsCompleted": 7,
      "totalSessions": 7,
      "percentComplete": 100,
      "completedAt": "2026-04-08T15:30:00Z"
    },
    {
      "seriesId": "series_002",
      "title": "Série: Vida em Comunidade",
      "sessionsCompleted": 3,
      "totalSessions": 5,
      "percentComplete": 60,
      "completedAt": null
    }
  ]
}
```

---

## 🏆 Módulo de Campanhas

### 1. Listar Campanhas Disponíveis

**Endpoint:** `GET /campaigns`

**Query Parameters:**
```
?limit=20&offset=0&status=ACTIVE
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "campaigns": [
    {
      "id": "campaign_001",
      "title": "Quaresma 2026",
      "slug": "quaresma-2026",
      "description": "Campanha de oração para Quaresma",
      "thumbnail": "https://...",
      "status": "ACTIVE",
      "startDate": "2026-03-05",
      "endDate": "2026-04-19",
      "participantsCount": 1250,
      "userJoined": false
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Obter Detalhes de uma Campanha

**Endpoint:** `GET /campaigns/{slug}`

**Path Parameters:**
```
slug = "quaresma-2026"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "campaign_001",
  "title": "Quaresma 2026",
  "slug": "quaresma-2026",
  "description": "Campanha de oração para Quaresma",
  "thumbnail": "https://...",
  "status": "ACTIVE",
  "startDate": "2026-03-05",
  "endDate": "2026-04-19",
  "participantsCount": 1250,
  "daysRemaining": 40,
  "rules": "Descrição das regras da campanha",
  "prizes": "Descrição dos prêmios",
  "userJoined": false,
  "userCheckIns": 0
}
```

---

### 3. Participar de uma Campanha

**Endpoint:** `POST /campaigns/{id}/join`

**Path Parameters:**
```
id = "campaign_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "message": "Campaign joined successfully!",
  "participantId": "participant_123",
  "campaign": {
    "id": "campaign_001",
    "title": "Quaresma 2026"
  }
}
```

---

### 4. Sair de uma Campanha

**Endpoint:** `POST /campaigns/{id}/leave`

**Path Parameters:**
```
id = "campaign_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Campaign left successfully"
}
```

---

### 5. Check-In em Campanha

**Endpoint:** `POST /campaigns/{id}/check-in`

**Path Parameters:**
```
id = "campaign_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "message": "Check-in recorded successfully!",
  "checkInCount": 15,
  "xpGained": 10,
  "nextCheckInAllowed": "2026-04-11T00:00:00Z"
}
```

---

### 6. Obter Leaderboard de Campanha

**Endpoint:** `GET /campaigns/{id}/leaderboard`

**Path Parameters:**
```
id = "campaign_001"
```

**Query Parameters:**
```
?limit=20
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "campaignId": "campaign_001",
  "leaderboard": [
    {
      "position": 1,
      "userId": "user_456",
      "userName": "João Silva",
      "avatar": "https://...",
      "checkIns": 40,
      "xpGained": 400,
      "isCurrentUser": false
    },
    {
      "position": 2,
      "userId": "user_123abc",
      "userName": "Seu Nome",
      "avatar": "https://...",
      "checkIns": 15,
      "xpGained": 150,
      "isCurrentUser": true
    }
  ],
  "yourPosition": 2
}
```

---

### 7. Obter Atualizações da Campanha

**Endpoint:** `GET /campaigns/{id}/updates`

**Path Parameters:**
```
id = "campaign_001"
```

**Query Parameters:**
```
?limit=10
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "updates": [
    {
      "id": "update_001",
      "campaignId": "campaign_001",
      "title": "Dia 20 da Campanha",
      "content": "Conteúdo da atualização",
      "createdAt": "2026-04-10T09:00:00Z",
      "createdBy": "admin"
    }
  ],
  "total": 20
}
```

---

### 8. Criar Atualização da Campanha (Admin)

**Endpoint:** `POST /campaigns/{id}/updates`

**Path Parameters:**
```
id = "campaign_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {adminToken}
```

**Request Body:**
```json
{
  "title": "Dia 20 da Campanha",
  "content": "Conteúdo da atualização"
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "update_001",
  "campaignId": "campaign_001",
  "title": "Dia 20 da Campanha",
  "content": "Conteúdo da atualização",
  "createdAt": "2026-04-10T09:00:00Z"
}
```

---

## 👫 Módulo de Grupos

### 1. Navegar Grupos Disponíveis

**Endpoint:** `GET /groups/browse`

**Query Parameters:**
```
?limit=20&offset=0&visibility=PUBLIC&search=oração
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "groups": [
    {
      "id": "group_001",
      "name": "Grupo de Oração Diária",
      "description": "Nos reunimos para orar juntos",
      "icon": "https://...",
      "membersCount": 45,
      "visibility": "PUBLIC",
      "createdAt": "2026-01-15T10:00:00Z",
      "userJoined": false
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Obter Meus Grupos

**Endpoint:** `GET /groups/my`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "groups": [
    {
      "id": "group_001",
      "name": "Grupo de Oração Diária",
      "description": "Nos reunimos para orar juntos",
      "icon": "https://...",
      "membersCount": 45,
      "role": "MEMBER",
      "joinedAt": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 3
}
```

---

### 3. Criar Novo Grupo

**Endpoint:** `POST /groups`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "Novo Grupo de Oração",
  "description": "Um grupo para oração comunitária",
  "visibility": "PUBLIC",
  "parishId": null
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "group_new",
  "name": "Novo Grupo de Oração",
  "description": "Um grupo para oração comunitária",
  "visibility": "PUBLIC",
  "icon": null,
  "creatorId": "user_123abc",
  "membersCount": 1,
  "createdAt": "2026-04-10T10:15:00Z"
}
```

---

### 4. Obter Detalhes do Grupo

**Endpoint:** `GET /groups/{id}`

**Path Parameters:**
```
id = "group_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "group_001",
  "name": "Grupo de Oração Diária",
  "description": "Nos reunimos para orar juntos",
  "icon": "https://...",
  "visibility": "PUBLIC",
  "creatorId": "user_456",
  "parishId": null,
  "membersCount": 45,
  "createdAt": "2026-01-15T10:00:00Z",
  "userRole": "MEMBER",
  "userJoinedAt": "2026-02-01T10:00:00Z"
}
```

---

### 5. Atualizar Grupo (Admin)

**Endpoint:** `PATCH /groups/{id}`

**Path Parameters:**
```
id = "group_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body (todos opcionais):**
```json
{
  "name": "Novo Nome do Grupo",
  "description": "Nova descrição",
  "visibility": "PRIVATE",
  "icon": "https://..."
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Group updated successfully",
  "group": {
    "id": "group_001",
    "name": "Novo Nome do Grupo",
    "description": "Nova descrição",
    "visibility": "PRIVATE",
    "updatedAt": "2026-04-10T10:15:00Z"
  }
}
```

---

### 6. Deletar Grupo (Admin)

**Endpoint:** `DELETE /groups/{id}`

**Path Parameters:**
```
id = "group_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Group deleted successfully"
}
```

---

### 7. Entrar em um Grupo

**Endpoint:** `POST /groups/{id}/join`

**Path Parameters:**
```
id = "group_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "message": "Group joined successfully!",
  "group": {
    "id": "group_001",
    "name": "Grupo de Oração Diária",
    "membersCount": 46
  }
}
```

---

### 8. Sair de um Grupo

**Endpoint:** `POST /groups/{id}/leave`

**Path Parameters:**
```
id = "group_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Group left successfully"
}
```

---

### 9. Listar Membros do Grupo

**Endpoint:** `GET /groups/{id}/members`

**Path Parameters:**
```
id = "group_001"
```

**Query Parameters:**
```
?limit=20&offset=0
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "members": [
    {
      "id": "member_123",
      "userId": "user_456",
      "name": "João Silva",
      "avatar": "https://...",
      "role": "ADMIN",
      "joinedAt": "2026-01-15T10:00:00Z"
    },
    {
      "id": "member_124",
      "userId": "user_123abc",
      "name": "Seu Nome",
      "avatar": "https://...",
      "role": "MEMBER",
      "joinedAt": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 45
}
```

---

### 10. Atualizar Role do Membro (Admin)

**Endpoint:** `PATCH /groups/{id}/members/{memberId}/role`

**Path Parameters:**
```
id = "group_001"
memberId = "member_124"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "role": "MODERATOR"
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Member role updated successfully",
  "member": {
    "id": "member_124",
    "role": "MODERATOR"
  }
}
```

**Roles Aceitos:**
- `ADMIN` - Controle total do grupo
- `MODERATOR` - Gerenciar membros e conteúdo
- `MEMBER` - Participante regular

---

## 📅 Módulo de Rotinas

### 1. Listar Rotinas

**Endpoint:** `GET /routines`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "routines": [
    {
      "id": "routine_001",
      "name": "Oração Matinal",
      "description": "Rotina de oração para começar o dia",
      "items": [
        {
          "id": "item_001",
          "name": "Ler liturgia",
          "order": 1,
          "completed": false
        },
        {
          "id": "item_002",
          "name": "Rezar o terço",
          "order": 2,
          "completed": true
        }
      ],
      "createdAt": "2026-04-01T08:00:00Z"
    }
  ]
}
```

---

### 2. Criar Rotina

**Endpoint:** `POST /routines`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "Oração Matinal",
  "description": "Rotina de oração para começar o dia",
  "items": [
    {
      "name": "Ler liturgia",
      "order": 1
    },
    {
      "name": "Rezar o terço",
      "order": 2
    }
  ]
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "routine_001",
  "name": "Oração Matinal",
  "description": "Rotina de oração para começar o dia",
  "items": [
    {
      "id": "item_001",
      "name": "Ler liturgia",
      "order": 1,
      "completed": false
    },
    {
      "id": "item_002",
      "name": "Rezar o terço",
      "order": 2,
      "completed": false
    }
  ],
  "createdAt": "2026-04-10T10:15:00Z"
}
```

---

### 3. Obter Rotina

**Endpoint:** `GET /routines/{id}`

**Path Parameters:**
```
id = "routine_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "routine_001",
  "name": "Oração Matinal",
  "description": "Rotina de oração para começar o dia",
  "items": [
    {
      "id": "item_001",
      "name": "Ler liturgia",
      "order": 1,
      "completed": false
    },
    {
      "id": "item_002",
      "name": "Rezar o terço",
      "order": 2,
      "completed": false
    }
  ],
  "createdAt": "2026-04-01T08:00:00Z"
}
```

---

### 4. Atualizar Rotina

**Endpoint:** `PATCH /routines/{id}`

**Path Parameters:**
```
id = "routine_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "Oração Matinal Revisada",
  "description": "Versão atualizada da rotina"
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Routine updated successfully",
  "routine": {
    "id": "routine_001",
    "name": "Oração Matinal Revisada",
    "description": "Versão atualizada da rotina",
    "updatedAt": "2026-04-10T10:15:00Z"
  }
}
```

---

### 5. Deletar Rotina

**Endpoint:** `DELETE /routines/{id}`

**Path Parameters:**
```
id = "routine_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Routine deleted successfully"
}
```

---

### 6. Adicionar Item à Rotina

**Endpoint:** `POST /routines/{id}/items`

**Path Parameters:**
```
id = "routine_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "Meditação",
  "order": 3
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "item_003",
  "routineId": "routine_001",
  "name": "Meditação",
  "order": 3,
  "completed": false
}
```

---

### 7. Atualizar Item da Rotina

**Endpoint:** `PATCH /routines/{id}/items/{itemId}`

**Path Parameters:**
```
id = "routine_001"
itemId = "item_003"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "Meditação Guiada",
  "order": 3
}
```

**Response 200 (Sucesso):**
```json
{
  "id": "item_003",
  "name": "Meditação Guiada",
  "order": 3,
  "completed": false
}
```

---

### 8. Deletar Item da Rotina

**Endpoint:** `DELETE /routines/{id}/items/{itemId}`

**Path Parameters:**
```
id = "routine_001"
itemId = "item_003"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Item deleted successfully"
}
```

---

### 9. Completar Rotina

**Endpoint:** `POST /routines/{id}/complete`

**Path Parameters:**
```
id = "routine_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 201 (Sucesso):**
```json
{
  "message": "Routine completed successfully!",
  "xpGained": 25,
  "completedAt": "2026-04-10T10:15:00Z"
}
```

---

## 🔔 Módulo de Lembretes

### 1. Listar Lembretes

**Endpoint:** `GET /reminders`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "reminders": [
    {
      "id": "reminder_001",
      "name": "Oração Matinal",
      "description": "Hora de rezar",
      "time": "07:00",
      "daysOfWeek": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      "enabled": true,
      "createdAt": "2026-04-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Criar Lembrete

**Endpoint:** `POST /reminders`

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "Oração Noturna",
  "description": "Hora de rezar antes de dormir",
  "time": "21:00",
  "daysOfWeek": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
}
```

**Response 201 (Sucesso):**
```json
{
  "id": "reminder_002",
  "name": "Oração Noturna",
  "description": "Hora de rezar antes de dormir",
  "time": "21:00",
  "daysOfWeek": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
  "enabled": true,
  "createdAt": "2026-04-10T10:15:00Z"
}
```

---

### 3. Obter Lembrete

**Endpoint:** `GET /reminders/{id}`

**Path Parameters:**
```
id = "reminder_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "reminder_001",
  "name": "Oração Matinal",
  "description": "Hora de rezar",
  "time": "07:00",
  "daysOfWeek": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
  "enabled": true,
  "createdAt": "2026-04-01T10:00:00Z"
}
```

---

### 4. Atualizar Lembrete

**Endpoint:** `PATCH /reminders/{id}`

**Path Parameters:**
```
id = "reminder_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "time": "06:30",
  "daysOfWeek": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
}
```

**Response 200 (Sucesso):**
```json
{
  "id": "reminder_001",
  "name": "Oração Matinal",
  "time": "06:30",
  "daysOfWeek": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "updatedAt": "2026-04-10T10:15:00Z"
}
```

---

### 5. Deletar Lembrete

**Endpoint:** `DELETE /reminders/{id}`

**Path Parameters:**
```
id = "reminder_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Reminder deleted successfully"
}
```

---

### 6. Alternar Lembrete (Ativar/Desativar)

**Endpoint:** `PATCH /reminders/{id}/toggle`

**Path Parameters:**
```
id = "reminder_001"
```

**Headers Obrigatórios:**
```http
Authorization: Bearer {accessToken}
```

**Response 200 (Sucesso):**
```json
{
  "id": "reminder_001",
  "enabled": false,
  "message": "Reminder disabled"
}
```

---

## ❌ Códigos de Erro

### Erros Padrão da API

**400 - Bad Request**
```json
{
  "statusCode": 400,
  "message": "Descrição do erro de validação",
  "details": ["campo1 é obrigatório", "campo2 deve ser um e-mail"]
}
```

**401 - Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Token inválido ou expirado"
}
```

**403 - Forbidden**
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar este recurso"
}
```

**404 - Not Found**
```json
{
  "statusCode": 404,
  "message": "Recurso não encontrado"
}
```

**409 - Conflict**
```json
{
  "statusCode": 409,
  "message": "Conflito: recurso já existe ou violação de restrição única"
}
```

**429 - Too Many Requests**
```json
{
  "statusCode": 429,
  "message": "Limite de requisições excedido. Tente novamente mais tarde.",
  "retryAfter": 60
}
```

**500 - Internal Server Error**
```json
{
  "statusCode": 500,
  "message": "Erro interno do servidor"
}
```

### Tratamento de Erros no App

```typescript
// Exemplo de tratamento de erro
try {
  const response = await api.post('/auth/register', userData);
} catch (error) {
  if (error.response.status === 400) {
    // Validação - mostrar erros de formulário
    showValidationErrors(error.response.data.details);
  } else if (error.response.status === 409) {
    // Email já existe
    showAlert('Email já cadastrado. Tente fazer login.');
  } else if (error.response.status === 429) {
    // Rate limit
    showAlert(`Muitas tentativas. Aguarde ${error.response.data.retryAfter}s`);
  } else {
    // Erro genérico
    showAlert('Erro ao processar requisição');
  }
}
```

---

## 🔑 Guia de Implementação para o App

### 1. Setup Inicial

```typescript
// 1. Configurar instância HTTP
const API_BASE_URL = 'http://localhost:3000/api/v1'; // dev
// const API_BASE_URL = 'https://api.sanctum.app/api/v1'; // prod

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. Adicionar interceptor para autenticação
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken(); // from secure storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Adicionar interceptor para renovar token
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. Fluxo de Login

```typescript
async function login(email: string, password: string) {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Armazenar tokens
    await secureStorage.setItem('accessToken', response.data.accessToken);
    await secureStorage.setItem('refreshToken', response.data.refreshToken);
    await secureStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

### 3. Renovar Token

```typescript
async function refreshAccessToken() {
  try {
    const refreshToken = await secureStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    
    await secureStorage.setItem('accessToken', response.data.accessToken);
    await secureStorage.setItem('refreshToken', response.data.refreshToken);
    
    return true;
  } catch (error) {
    // Logout user
    await logout();
    return false;
  }
}
```

### 4. Armazenar dados em Secure Storage

```typescript
// iOS: Keychain
// Android: Keystore

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Para tokens (secure)
await SecureStore.setItemAsync('accessToken', token);

// Para dados não-sensíveis (async storage)
await AsyncStorage.setItem('user', JSON.stringify(user));
```

---

## 📊 Dados Úteis para o App

### Tabela de Livros Bíblicos

```json
[
  { "id": "GEN", "name": "Gênesis", "abbreviation": "Gn", "chapters": 50 },
  { "id": "EXO", "name": "Êxodo", "abbreviation": "Ex", "chapters": 40 },
  { "id": "LEV", "name": "Levítico", "abbreviation": "Lv", "chapters": 27 },
  // ... mais 70 livros
]
```

### Mistérios do Rosário

```json
{
  "JOYFUL": ["Anunciação", "Visitação", "Nascimento de Jesus", "Apresentação", "Milagre em Caná"],
  "SORROWFUL": ["Agonia no Horto", "Flagelação", "Coroação de Espinhos", "Via Sacra", "Crucifixão"],
  "GLORIOUS": ["Ressurreição", "Ascensão", "Descida do E.S.", "Assunção", "Coroação"],
  "LUMINOUS": ["Batismo", "Bodas de Caná", "Anúncio do Reino", "Transfiguração", "Eucaristia"]
}
```

---

## 🚀 Checklist de Implementação

- [ ] Configurar instância HTTP com interceptores
- [ ] Implementar fluxo de autenticação
- [ ] Configurar Secure Storage para tokens
- [ ] Implementar login/registro
- [ ] Configurar onboarding
- [ ] Implementar feed de Bíblia
- [ ] Implementar tracker de Liturgia
- [ ] Implementar Rosário diário
- [ ] Implementar sistema de Streak
- [ ] Implementar gamificação (XP, badges)
- [ ] Implementar comunidade (pedidos de oração)
- [ ] Implementar recomendações
- [ ] Implementar conteúdo sob demanda
- [ ] Implementar campanhas
- [ ] Implementar grupos
- [ ] Implementar rotinas
- [ ] Implementar lembretes
- [ ] Implementar notificações push

---

## 📞 Suporte

Para dúvidas sobre a API:
- Email: api-support@sanctum.app
- Documentação: https://docs.sanctum.app
- Issues: https://github.com/sanctum/api/issues

---

**Última atualização:** 2026-04-10  
**Status da API:** ✅ Em Produção  
**Versão:** 1.0.0
