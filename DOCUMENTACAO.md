
# Documentação do Projeto SaberAngola

## Visão Geral

O SaberAngola é uma plataforma académica abrangente projetada para democratizar o acesso ao conhecimento em Angola. A aplicação serve como um hub centralizado para estudantes, educadores e pesquisadores partilharem recursos, colaborarem em grupos de estudo, gerarem documentos académicos e construírem redes profissionais dentro da comunidade académica angolana.

## Funcionalidades Principais

### 🎓 Sistema de Biblioteca Académica
- Gestão de livros e monografias com metadados completos
- Organização por categorias com capacidades de pesquisa e filtros
- Sistema de downloads e análise de visualizações
- Controlo de visibilidade de conteúdo público e privado

### 👥 Plataforma de Grupos de Estudo
- Criação de grupos com etiquetas de assunto, nível e instituição
- Gestão de membros com permissões baseadas em funções
- Mensagens em tempo real dentro dos grupos
- Rastreamento de atividades e métricas de envolvimento

### 📋 Sistema de Geração de Documentos
- Criação de documentos baseada em templates (CVs, cartas, papers académicos)
- Histórico e gestão de documentos específicos do utilizador
- Funcionalidade de exportação para documentos gerados
- Integração com dados do perfil do utilizador

### 🔐 Autenticação e Autorização
- Autenticação via email/password usando Supabase Auth
- Gestão de sessões com AuthProvider personalizado
- Rotas protegidas para utilizadores não autenticados
- Perfis de utilizador estendidos com credenciais académicas

### 💬 Sistema de Comunicação
- Funcionalidade de chat em tempo real para mensagens diretas
- Mensagens baseadas em grupos dentro dos grupos de estudo
- Histórico de mensagens e gestão de conversas
- Indicadores de status online e presença

## Arquitetura Técnica

### Frontend
- **Framework**: React 18 com TypeScript
- **Roteamento**: React Router com rotas protegidas
- **Estado**: TanStack Query para gestão de estado do servidor
- **UI**: Tailwind CSS com biblioteca de componentes shadcn/ui
- **Animações**: Framer Motion
- **Ferramenta de Build**: Vite

### Backend
- **Servidor**: Express.js com TypeScript
- **Base de Dados**: PostgreSQL com Drizzle ORM
- **Autenticação**: Supabase Auth
- **CORS**: Configurado para múltiplas origens de desenvolvimento
- **API**: RESTful com estrutura modular de rotas

### Estrutura da Base de Dados
```
Tabelas principais:
- users: Perfis de utilizadores e credenciais
- institutions: Instituições educacionais
- books: Biblioteca de livros e monografias
- groups: Grupos de estudo
- posts: Publicações e conteúdo social
- videos: Conteúdo audiovisual
- messages: Sistema de chat
- follows: Sistema de seguimento social
```

## Configuração do Ambiente

### Pré-requisitos
- Node.js 20+
- npm ou bun
- PostgreSQL (via Neon Database)
- Supabase account

### Variáveis de Ambiente
Crie um arquivo `.env` com:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_neon_database_url
PORT=5000
NODE_ENV=development
```

### Instalação
```bash
# Instalar dependências
npm install

# Executar migrações da base de dados
npm run db:push

# Iniciar servidor de desenvolvimento
npm run dev
```

## Estrutura de Pastas

```
/
├── src/                    # Código fonte do frontend
│   ├── components/         # Componentes React reutilizáveis
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários e configurações
│   ├── pages/             # Páginas da aplicação
│   └── integrations/      # Integrações externas
├── server/                 # Código do backend
│   ├── routes/            # Rotas da API
│   └── index.ts           # Servidor Express principal
├── shared/                 # Código partilhado (schemas)
├── supabase/              # Configurações e migrações Supabase
└── dist/                  # Build de produção
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de utilizador
- `GET /api/auth/profile/:userId` - Obter perfil do utilizador

### Livros
- `GET /api/books` - Listar livros (com filtros opcionais)
- `GET /api/books/:id` - Obter livro específico
- `POST /api/books` - Criar novo livro

### Grupos
- `GET /api/groups` - Listar grupos
- `GET /api/groups/:id` - Obter grupo específico
- `POST /api/groups` - Criar novo grupo
- `GET /api/groups/:id/messages` - Obter mensagens do grupo

### Publicações
- `GET /api/posts` - Listar publicações
- `POST /api/posts` - Criar nova publicação
- `POST /api/posts/:id/like` - Dar like numa publicação

### Vídeos
- `GET /api/videos` - Listar vídeos
- `GET /api/videos/:id` - Obter vídeo específico
- `POST /api/videos` - Criar novo vídeo

### Instituições
- `GET /api/institutions` - Listar instituições
- `GET /api/institutions/:id` - Obter instituição específica
- `POST /api/institutions` - Criar nova instituição

## Padrões de Desenvolvimento

### Gestão de Estado
- React Query para cache e sincronização de dados
- Context API para estado de autenticação
- Local state com useState/useReducer para estado de componentes

### Estilização
- Sistema de cores baseado em HSL com propriedades CSS personalizadas
- Design responsivo com abordagem mobile-first
- Componentes reutilizáveis com styling baseado em variantes

### Tratamento de Erros
- Notificações toast para feedback do utilizador
- Middleware de tratamento de erros no servidor
- Estados de carregamento com skeleton loaders

## Comandos de Desenvolvimento

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build           # Build de produção
npm run build:dev       # Build de desenvolvimento
npm run preview         # Preview do build
npm run lint            # Verificação de código

# Base de dados
npm run db:push         # Aplicar schema à base de dados
npm run db:studio       # Abrir Drizzle Studio
```

## Deploy

O projeto está configurado para deploy no Replit com as seguintes configurações:

- **Build Command**: `npm run build`
- **Run Command**: `npm run start`
- **Porta**: 5000 (backend) / 8080-8083 (frontend dev)

### Workflow de Deploy
1. Fazer push das alterações para o repositório
2. O sistema automaticamente fará build e deploy
3. A aplicação estará disponível no domínio Replit

## Estrutura de Componentes

### Componentes de Layout
- `AppLayout`: Layout principal da aplicação
- `Navbar`: Barra de navegação
- `Sidebar`: Barra lateral com navegação
- `Footer`: Rodapé da aplicação

### Componentes de Dashboard
- `DashboardOverview`: Visão geral do dashboard
- `LibrarySection`: Secção da biblioteca
- `StudyGroups`: Gestão de grupos de estudo
- `AcademicFeed`: Feed de conteúdo académico

### Componentes de UI
- Biblioteca completa de componentes shadcn/ui
- Componentes personalizados para funcionalidades específicas
- Sistema de temas com suporte para modo escuro

## Boas Práticas

### Código
- TypeScript para type safety
- Componentes funcionais com hooks
- Props tipadas e interfaces bem definidas
- Separação clara entre lógica de negócio e apresentação

### Base de Dados
- Relacionamentos bem definidos entre tabelas
- Índices para otimização de consultas
- Validação de dados no lado do servidor
- Timestamps automáticos para auditoria

### Segurança
- Autenticação obrigatória para rotas protegidas
- Validação de dados de entrada
- Sanitização de parâmetros de consulta
- Headers de segurança configurados

## Contribuição

### Fluxo de Trabalho
1. Fork do repositório principal
2. Criar branch para feature/fix
3. Desenvolver e testar localmente
4. Criar pull request com descrição detalhada
5. Review de código e merge

### Padrões de Código
- Seguir convenções de nomenclatura estabelecidas
- Escrever testes para novas funcionalidades
- Documentar funções complexas
- Manter consistência no estilo de código

## Resolução de Problemas

### Problemas Comuns
- **Erro de CORS**: Verificar configuração de origens permitidas
- **Conexão DB**: Verificar string de conexão e credenciais
- **Build falha**: Verificar dependências e versões
- **Rotas 404**: Verificar configuração do servidor para SPA

### Logs e Debug
- Logs do servidor disponíveis no console
- React Query DevTools para debug de queries
- Network tab do browser para debug de API calls

## Roadmap Futuro

### Funcionalidades Planeadas
- Sistema de notificações em tempo real
- Integração com plataformas de videoconferência
- Sistema de avaliações e feedback
- Analytics e relatórios avançados
- Mobile app nativo
- Integração com APIs de instituições

### Melhorias Técnicas
- Implementação de testes automatizados
- Otimização de performance
- Implementação de PWA
- Sistema de cache avançado
- Monitorização e alertas

## Contactos e Suporte

Para questões técnicas ou sugestões de melhorias, contactar a equipa de desenvolvimento através dos canais oficiais do projeto.

---

*Documentação atualizada em: Janeiro 2025*
*Versão: 1.0.0*
