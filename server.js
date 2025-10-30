const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ==================== ROTAS DA API ====================

// Listar todas as concessionárias
app.get('/api/concessionarias', (req, res) => {
  const { status, search } = req.query;

  let query = 'SELECT * FROM concessionarias WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (nome LIKE ? OR cidade LIKE ? OR responsavel LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Buscar uma concessionária por ID
app.get('/api/concessionarias/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM concessionarias WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Concessionária não encontrada' });
      return;
    }
    res.json(row);
  });
});

// Criar nova concessionária
app.post('/api/concessionarias', (req, res) => {
  const {
    nome,
    cnpj,
    telefone,
    email,
    endereco,
    cidade,
    estado,
    responsavel,
    cargo_responsavel,
    status,
    observacoes
  } = req.body;

  if (!nome || !telefone || !cidade) {
    res.status(400).json({ error: 'Nome, telefone e cidade são obrigatórios' });
    return;
  }

  const query = `
    INSERT INTO concessionarias (
      nome, cnpj, telefone, email, endereco, cidade, estado,
      responsavel, cargo_responsavel, status, observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [nome, cnpj, telefone, email, endereco, cidade, estado,
     responsavel, cargo_responsavel, status || 'novo', observacoes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: 'Concessionária criada com sucesso'
      });
    }
  );
});

// Atualizar concessionária
app.put('/api/concessionarias/:id', (req, res) => {
  const { id } = req.params;
  const {
    nome,
    cnpj,
    telefone,
    email,
    endereco,
    cidade,
    estado,
    responsavel,
    cargo_responsavel,
    status,
    observacoes
  } = req.body;

  const query = `
    UPDATE concessionarias SET
      nome = ?, cnpj = ?, telefone = ?, email = ?, endereco = ?,
      cidade = ?, estado = ?, responsavel = ?, cargo_responsavel = ?,
      status = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    query,
    [nome, cnpj, telefone, email, endereco, cidade, estado,
     responsavel, cargo_responsavel, status, observacoes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Concessionária não encontrada' });
        return;
      }
      res.json({ message: 'Concessionária atualizada com sucesso' });
    }
  );
});

// Deletar concessionária
app.delete('/api/concessionarias/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM concessionarias WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Concessionária não encontrada' });
      return;
    }
    res.json({ message: 'Concessionária deletada com sucesso' });
  });
});

// ==================== INTERAÇÕES ====================

// Listar interações de uma concessionária
app.get('/api/concessionarias/:id/interacoes', (req, res) => {
  const { id } = req.params;

  db.all(
    'SELECT * FROM interacoes WHERE concessionaria_id = ? ORDER BY data DESC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Adicionar interação
app.post('/api/interacoes', (req, res) => {
  const { concessionaria_id, tipo, descricao, proximo_contato } = req.body;

  if (!concessionaria_id || !tipo || !descricao) {
    res.status(400).json({ error: 'Concessionária, tipo e descrição são obrigatórios' });
    return;
  }

  db.run(
    `INSERT INTO interacoes (concessionaria_id, tipo, descricao, proximo_contato)
     VALUES (?, ?, ?, ?)`,
    [concessionaria_id, tipo, descricao, proximo_contato],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: 'Interação registrada com sucesso'
      });
    }
  );
});

// ==================== ESTATÍSTICAS ====================

// Dashboard com estatísticas
app.get('/api/dashboard', (req, res) => {
  const stats = {};

  // Total de concessionárias
  db.get('SELECT COUNT(*) as total FROM concessionarias', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    stats.total = row.total;

    // Concessionárias por status
    db.all(
      'SELECT status, COUNT(*) as count FROM concessionarias GROUP BY status',
      [],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        stats.por_status = rows;

        // Interações nos últimos 30 dias
        db.get(
          `SELECT COUNT(*) as count FROM interacoes
           WHERE data >= datetime('now', '-30 days')`,
          [],
          (err, row) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            stats.interacoes_30dias = row.count;

            // Próximos contatos
            db.all(
              `SELECT c.nome, i.proximo_contato, i.descricao
               FROM interacoes i
               JOIN concessionarias c ON i.concessionaria_id = c.id
               WHERE i.proximo_contato >= date('now')
               ORDER BY i.proximo_contato ASC
               LIMIT 10`,
              [],
              (err, rows) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                stats.proximos_contatos = rows;
                res.json(stats);
              }
            );
          }
        );
      }
    );
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor CRM rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}`);
  console.log(`🌐 Acesso externo: http://21.0.0.150:${PORT}`);
});
