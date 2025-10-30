const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar/conectar ao banco de dados
const db = new sqlite3.Database(path.join(__dirname, 'crm.db'), (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
    initDatabase();
  }
});

// Inicializar tabelas
function initDatabase() {
  // Tabela de concessionárias
  db.run(`
    CREATE TABLE IF NOT EXISTS concessionarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cnpj TEXT,
      telefone TEXT NOT NULL,
      email TEXT,
      endereco TEXT,
      cidade TEXT NOT NULL,
      estado TEXT,
      responsavel TEXT,
      cargo_responsavel TEXT,
      status TEXT DEFAULT 'novo',
      observacoes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela concessionarias:', err.message);
    } else {
      console.log('✅ Tabela concessionarias criada/verificada');
    }
  });

  // Tabela de interações
  db.run(`
    CREATE TABLE IF NOT EXISTS interacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concessionaria_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP,
      proximo_contato DATE,
      FOREIGN KEY (concessionaria_id) REFERENCES concessionarias(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela interacoes:', err.message);
    } else {
      console.log('✅ Tabela interacoes criada/verificada');
    }
  });

  // Inserir dados de exemplo (apenas se não existirem)
  db.get('SELECT COUNT(*) as count FROM concessionarias', [], (err, row) => {
    if (!err && row.count === 0) {
      console.log('📝 Inserindo dados de exemplo...');

      const exemplos = [
        {
          nome: 'AutoMaster Veículos',
          cnpj: '12.345.678/0001-90',
          telefone: '(11) 98765-4321',
          email: 'contato@automaster.com.br',
          endereco: 'Av. Principal, 1000',
          cidade: 'São Paulo',
          estado: 'SP',
          responsavel: 'João Silva',
          cargo_responsavel: 'Gerente Comercial',
          status: 'em_contato',
          observacoes: 'Interessado em campanhas digitais'
        },
        {
          nome: 'VelocidadeMax Concessionária',
          cnpj: '98.765.432/0001-10',
          telefone: '(21) 97654-3210',
          email: 'comercial@velocidademax.com.br',
          endereco: 'Rua das Flores, 500',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          responsavel: 'Maria Santos',
          cargo_responsavel: 'Diretora de Marketing',
          status: 'proposta_enviada',
          observacoes: 'Proposta de R$ 15.000 enviada em 15/10'
        },
        {
          nome: 'MotorPlus Automóveis',
          cnpj: '11.222.333/0001-44',
          telefone: '(31) 96543-2109',
          email: 'info@motorplus.com.br',
          endereco: 'Av. dos Estados, 2500',
          cidade: 'Belo Horizonte',
          estado: 'MG',
          responsavel: 'Carlos Oliveira',
          cargo_responsavel: 'Proprietário',
          status: 'novo',
          observacoes: 'Primeiro contato realizado'
        }
      ];

      const insertStmt = db.prepare(`
        INSERT INTO concessionarias (
          nome, cnpj, telefone, email, endereco, cidade, estado,
          responsavel, cargo_responsavel, status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      exemplos.forEach(ex => {
        insertStmt.run(
          ex.nome, ex.cnpj, ex.telefone, ex.email, ex.endereco,
          ex.cidade, ex.estado, ex.responsavel, ex.cargo_responsavel,
          ex.status, ex.observacoes
        );
      });

      insertStmt.finalize(() => {
        // Adicionar interações de exemplo
        const interacoes = [
          { concessionaria_id: 1, tipo: 'Ligação', descricao: 'Primeira ligação de apresentação. Responsável demonstrou interesse.', proximo_contato: '2025-11-05' },
          { concessionaria_id: 1, tipo: 'Email', descricao: 'Enviado material institucional e cases de sucesso.', proximo_contato: null },
          { concessionaria_id: 2, tipo: 'Reunião', descricao: 'Reunião presencial. Apresentação da proposta de marketing digital.', proximo_contato: '2025-11-02' },
          { concessionaria_id: 3, tipo: 'WhatsApp', descricao: 'Contato inicial via WhatsApp. Agendada ligação para próxima semana.', proximo_contato: '2025-11-01' }
        ];

        const interacaoStmt = db.prepare(`
          INSERT INTO interacoes (concessionaria_id, tipo, descricao, proximo_contato)
          VALUES (?, ?, ?, ?)
        `);

        interacoes.forEach(int => {
          interacaoStmt.run(int.concessionaria_id, int.tipo, int.descricao, int.proximo_contato);
        });

        interacaoStmt.finalize(() => {
          console.log('✅ Dados de exemplo inseridos com sucesso');
        });
      });
    }
  });
}

module.exports = db;
