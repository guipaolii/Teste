# 🚗 CRM para Prospecção de Concessionárias

Sistema de CRM simplificado e eficiente para agências de marketing especializadas em prospecção de concessionárias. Gerencie leads, acompanhe interações e otimize seu processo de vendas.

## ✨ Funcionalidades

### 📊 Dashboard Inteligente
- Visualização de estatísticas em tempo real
- Total de concessionárias cadastradas
- Métricas por status (novos, em contato, propostas enviadas)
- Histórico de interações dos últimos 30 dias
- Agenda de próximos contatos

### 🏢 Gestão de Concessionárias
- Cadastro completo de concessionárias
- Informações de contato e endereço
- Gerenciamento de responsáveis
- Sistema de status personalizado
- Busca e filtros avançados
- Edição e exclusão de registros

### 📝 Histórico de Interações
- Registro de todos os contatos (ligações, emails, reuniões, WhatsApp)
- Descrição detalhada de cada interação
- Agendamento de próximos contatos
- Histórico completo por concessionária

### 🎯 Status de Prospecção
- **Novo**: Lead recém-adicionado
- **Em Contato**: Processo de prospecção iniciado
- **Proposta Enviada**: Proposta comercial enviada
- **Negociação**: Em processo de negociação
- **Fechado**: Negócio concluído com sucesso
- **Perdido**: Oportunidade não concretizada

## 🚀 Tecnologias

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **SQLite**: Banco de dados leve e eficiente
- **CORS**: Habilitação de requisições cross-origin

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com gradientes e animações
- **JavaScript (Vanilla)**: Interatividade sem dependências

## 📦 Instalação

### Pré-requisitos
- Node.js versão 14 ou superior
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd Teste
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor**
```bash
npm start
```

4. **Acesse o sistema**
```
http://localhost:3000
```

## 🔧 Modo de Desenvolvimento

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
Teste/
├── public/                 # Frontend
│   ├── index.html         # Página principal
│   ├── styles.css         # Estilos
│   └── app.js             # JavaScript
├── server.js              # Servidor Express e rotas da API
├── database.js            # Configuração do banco de dados
├── crm.db                 # Banco de dados SQLite (gerado automaticamente)
├── package.json           # Dependências e scripts
├── .gitignore            # Arquivos ignorados pelo Git
└── README.md              # Documentação
```

## 🔌 API Endpoints

### Concessionárias

#### Listar todas
```http
GET /api/concessionarias?status=novo&search=termo
```

#### Buscar por ID
```http
GET /api/concessionarias/:id
```

#### Criar nova
```http
POST /api/concessionarias
Content-Type: application/json

{
  "nome": "AutoMaster Veículos",
  "cnpj": "12.345.678/0001-90",
  "telefone": "(11) 98765-4321",
  "email": "contato@automaster.com.br",
  "endereco": "Av. Principal, 1000",
  "cidade": "São Paulo",
  "estado": "SP",
  "responsavel": "João Silva",
  "cargo_responsavel": "Gerente Comercial",
  "status": "novo",
  "observacoes": "Interessado em campanhas digitais"
}
```

#### Atualizar
```http
PUT /api/concessionarias/:id
Content-Type: application/json

{
  "nome": "AutoMaster Veículos",
  "status": "em_contato",
  ...
}
```

#### Excluir
```http
DELETE /api/concessionarias/:id
```

### Interações

#### Listar interações de uma concessionária
```http
GET /api/concessionarias/:id/interacoes
```

#### Adicionar interação
```http
POST /api/interacoes
Content-Type: application/json

{
  "concessionaria_id": 1,
  "tipo": "Ligação",
  "descricao": "Primeira ligação de apresentação",
  "proximo_contato": "2025-11-05"
}
```

### Dashboard

#### Obter estatísticas
```http
GET /api/dashboard
```

Retorna:
```json
{
  "total": 10,
  "por_status": [
    { "status": "novo", "count": 3 },
    { "status": "em_contato", "count": 5 },
    ...
  ],
  "interacoes_30dias": 25,
  "proximos_contatos": [...]
}
```

## 💡 Uso do Sistema

### 1. Dashboard
- Visualize métricas importantes de forma rápida
- Acompanhe os próximos contatos agendados
- Monitore a atividade dos últimos 30 dias

### 2. Cadastro de Concessionárias
- Clique em "Nova Concessionária"
- Preencha os dados obrigatórios (nome, telefone, cidade)
- Adicione informações adicionais conforme necessário
- Clique em "Salvar Concessionária"

### 3. Visualização e Edição
- Na aba "Concessionárias", veja todas as concessionárias cadastradas
- Use os filtros para buscar por nome, cidade ou responsável
- Filtre por status específico
- Clique em "Ver" para visualizar detalhes completos
- Clique em "Editar" para modificar informações

### 4. Registro de Interações
- Abra os detalhes de uma concessionária (botão "Ver")
- Role até "Histórico de Interações"
- Preencha o formulário com tipo, descrição e próximo contato
- Clique em "Adicionar Interação"

### 5. Acompanhamento
- O histórico completo fica disponível nos detalhes
- Próximos contatos aparecem no dashboard
- Use o status para organizar o funil de vendas

## 🎨 Personalização

### Cores
Edite as cores no arquivo `public/styles.css`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Status
Adicione novos status editando:
- `public/index.html` (opções do select)
- `public/app.js` (função formatStatus)
- `public/styles.css` (classes de badge)

## 📊 Dados de Exemplo

O sistema vem com dados de exemplo para facilitar os testes:
- 3 concessionárias pré-cadastradas
- Diferentes status e localizações
- Interações registradas
- Próximos contatos agendados

Para começar com banco vazio, delete o arquivo `crm.db` antes de iniciar.

## 🔒 Segurança

⚠️ **Nota**: Este é um sistema simplificado para uso interno. Para produção, considere:
- Adicionar autenticação de usuários
- Implementar HTTPS
- Validação mais robusta de dados
- Backup automático do banco de dados
- Rate limiting nas APIs

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para reportar bugs ou solicitar features:
- Abra uma issue no GitHub
- Envie um email para suporte@exemplo.com

## 🎯 Roadmap

Funcionalidades planejadas:
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Integração com email (Gmail, Outlook)
- [ ] Notificações de próximos contatos
- [ ] Múltiplos usuários e permissões
- [ ] Relatórios avançados e gráficos
- [ ] Integração com WhatsApp Business API
- [ ] Mobile app (React Native)
- [ ] Automação de follow-ups

## 🏆 Créditos

Desenvolvido para agências de marketing especializadas em prospecção de concessionárias.

---

**Feito com ❤️ para otimizar sua prospecção de clientes**
