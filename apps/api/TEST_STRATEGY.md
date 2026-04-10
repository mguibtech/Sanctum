# 🧪 Estratégia de Testes - Backend API

**Data:** 2026-04-10  
**Status:** Documentação e Framework Setup ✅

---

## 📋 Plano de Testes

### Fase 1: Unit Tests (Atual)
Testes unitários para serviços principais:
- ✅ AuthService (Autenticação)
- ✅ UsersService (Gerenciamento de Usuários)
- ✅ BibleService (Bíblia)

### Fase 2: Integration Tests
- [ ] Testes E2E com dados reais
- [ ] Fluxo completo de autenticação
- [ ] Endpoints protegidos

### Fase 3: Load Tests
- [ ] Performance testing
- [ ] Rate limiting validation
- [ ] Database stress tests

---

## 🛠️ Setup de Testes

### Dependências Instaladas
```bash
npm install --save-dev jest ts-jest @types/jest
```

### Configuração Jest
**jest.config.js** - Configurado para:
- TypeScript transpilation
- Coverage reports
- Test patterns

**tsconfig.json** - Atualizado:
- Jest types adicionados
- Test files incluídos

---

## 📝 Estrutura de Testes

### Padrão de Nomenclatura
```
src/modules/[module]/[service].spec.ts
```

### Exemplo de Teste
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Teste aqui
    });
  });
});
```

---

## 🚀 Executando Testes

### Rodar todos os testes
```bash
npm test
```

### Rodar com coverage
```bash
npm test -- --coverage
```

### Rodar um arquivo específico
```bash
npm test -- auth.service.spec.ts
```

### Watch mode
```bash
npm test -- --watch
```

---

## ✅ Checklist de Testes

### AuthService
- [x] Register flow
- [x] Login flow
- [x] Token validation
- [x] Refresh token
- [ ] Logout
- [ ] Password reset

### UsersService
- [x] Create user
- [x] Find by email
- [x] Find by ID
- [x] Update profile
- [x] Delete user
- [ ] Get user stats

### BibleService
- [x] Get books
- [x] Get chapter
- [x] Save passage
- [x] Get saved passages
- [x] Delete passage
- [ ] Search passages

---

## 📊 Métricas de Cobertura Esperadas

| Módulo | Objetivo | Status |
|--------|----------|--------|
| Auth | 85% | ⏳ Setup |
| Users | 80% | ⏳ Setup |
| Bible | 75% | ⏳ Setup |
| Gamification | 70% | 📋 Planned |
| Community | 70% | 📋 Planned |

---

## 🔗 Próximas Ações

1. **Ajustar testes** aos tipos reais dos serviços
2. **Implementar mocks** corretamente
3. **Adicionar fixtures** para dados de teste
4. **Integrar com CI/CD** (já configurado em GitHub Actions)
5. **Monitorar cobertura** via Codecov

---

## 💡 Recursos

- [NestJS Testing Docs](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://code.visualstudio.com/docs/nodejs/nodejs-testing)
