// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Estado global
let currentConcessionariaId = null;

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    // Configurar navegação por tabs
    setupTabs();

    // Configurar formulários
    setupForms();

    // Configurar filtros
    setupFilters();

    // Carregar dados iniciais
    loadDashboard();
    loadConcessionarias();
});

// ==================== NAVEGAÇÃO ====================

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Atualizar botões
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Atualizar conteúdo
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });

            // Recarregar dados se necessário
            if (tabId === 'dashboard') {
                loadDashboard();
            } else if (tabId === 'concessionarias') {
                loadConcessionarias();
            }
        });
    });
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`);
        const data = await response.json();

        // Atualizar estatísticas
        document.getElementById('stat-total').textContent = data.total;
        document.getElementById('stat-interacoes').textContent = data.interacoes_30dias;

        // Estatísticas por status
        const statusCounts = {
            novo: 0,
            em_contato: 0,
            proposta_enviada: 0
        };

        data.por_status.forEach(item => {
            if (statusCounts.hasOwnProperty(item.status)) {
                statusCounts[item.status] = item.count;
            }
        });

        document.getElementById('stat-novo').textContent = statusCounts.novo;
        document.getElementById('stat-contato').textContent = statusCounts.em_contato;
        document.getElementById('stat-proposta').textContent = statusCounts.proposta_enviada;

        // Próximos contatos
        const proximosContainer = document.getElementById('proximos-contatos');

        if (data.proximos_contatos && data.proximos_contatos.length > 0) {
            proximosContainer.innerHTML = data.proximos_contatos.map(contato => `
                <div class="contato-item">
                    <strong>${contato.nome}</strong>
                    <div>${contato.descricao}</div>
                    <div class="data">📅 ${formatDate(contato.proximo_contato)}</div>
                </div>
            `).join('');
        } else {
            proximosContainer.innerHTML = '<p class="empty-state">Nenhum contato agendado</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dashboard', 'error');
    }
}

// ==================== CONCESSIONÁRIAS ====================

async function loadConcessionarias() {
    const status = document.getElementById('filter-status').value;
    const search = document.getElementById('search').value;

    try {
        let url = `${API_URL}/concessionarias?`;
        if (status) url += `status=${status}&`;
        if (search) url += `search=${search}`;

        const response = await fetch(url);
        const concessionarias = await response.json();

        const tbody = document.getElementById('concessionarias-tbody');

        if (concessionarias.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        Nenhuma concessionária encontrada
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = concessionarias.map(c => `
            <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.cidade}${c.estado ? '/' + c.estado : ''}</td>
                <td>${c.responsavel || '-'}</td>
                <td>${c.telefone}</td>
                <td><span class="status-badge status-${c.status}">${formatStatus(c.status)}</span></td>
                <td>
                    <button class="action-btn btn-primary" onclick="viewDetails(${c.id})">Ver</button>
                    <button class="action-btn btn-secondary" onclick="editConcessionaria(${c.id})">Editar</button>
                    <button class="action-btn btn-danger" onclick="deleteConcessionaria(${c.id}, '${c.nome}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar concessionárias:', error);
        showNotification('Erro ao carregar concessionárias', 'error');
    }
}

// ==================== FORMULÁRIOS ====================

function setupForms() {
    // Formulário de concessionária
    const formConcessionaria = document.getElementById('form-concessionaria');
    formConcessionaria.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveConcessionaria();
    });

    // Formulário de interação
    const formInteracao = document.getElementById('form-interacao');
    formInteracao.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveInteracao();
    });
}

async function saveConcessionaria() {
    const editId = document.getElementById('edit-id').value;
    const data = {
        nome: document.getElementById('nome').value,
        cnpj: document.getElementById('cnpj').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        responsavel: document.getElementById('responsavel').value,
        cargo_responsavel: document.getElementById('cargo_responsavel').value,
        status: document.getElementById('status').value,
        observacoes: document.getElementById('observacoes').value
    };

    try {
        const url = editId ? `${API_URL}/concessionarias/${editId}` : `${API_URL}/concessionarias`;
        const method = editId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification(editId ? 'Concessionária atualizada com sucesso!' : 'Concessionária criada com sucesso!', 'success');
            resetForm();
            loadConcessionarias();

            // Voltar para aba de listagem
            document.querySelector('[data-tab="concessionarias"]').click();
        } else {
            showNotification(result.error || 'Erro ao salvar concessionária', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar concessionária:', error);
        showNotification('Erro ao salvar concessionária', 'error');
    }
}

async function editConcessionaria(id) {
    try {
        const response = await fetch(`${API_URL}/concessionarias/${id}`);
        const c = await response.json();

        // Preencher formulário
        document.getElementById('edit-id').value = c.id;
        document.getElementById('nome').value = c.nome;
        document.getElementById('cnpj').value = c.cnpj || '';
        document.getElementById('telefone').value = c.telefone;
        document.getElementById('email').value = c.email || '';
        document.getElementById('endereco').value = c.endereco || '';
        document.getElementById('cidade').value = c.cidade;
        document.getElementById('estado').value = c.estado || '';
        document.getElementById('responsavel').value = c.responsavel || '';
        document.getElementById('cargo_responsavel').value = c.cargo_responsavel || '';
        document.getElementById('status').value = c.status;
        document.getElementById('observacoes').value = c.observacoes || '';

        // Ir para aba de edição
        document.querySelector('[data-tab="nova"]').click();

        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Erro ao carregar concessionária:', error);
        showNotification('Erro ao carregar concessionária', 'error');
    }
}

async function deleteConcessionaria(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir a concessionária "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/concessionarias/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Concessionária excluída com sucesso!', 'success');
            loadConcessionarias();
            loadDashboard();
        } else {
            const result = await response.json();
            showNotification(result.error || 'Erro ao excluir concessionária', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir concessionária:', error);
        showNotification('Erro ao excluir concessionária', 'error');
    }
}

function resetForm() {
    document.getElementById('form-concessionaria').reset();
    document.getElementById('edit-id').value = '';
}

// ==================== DETALHES E INTERAÇÕES ====================

async function viewDetails(id) {
    currentConcessionariaId = id;

    try {
        // Carregar dados da concessionária
        const response = await fetch(`${API_URL}/concessionarias/${id}`);
        const c = await response.json();

        // Atualizar modal
        document.getElementById('modal-title').textContent = c.nome;

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <label>CNPJ</label>
                    <div class="value">${c.cnpj || '-'}</div>
                </div>
                <div class="info-item">
                    <label>Telefone</label>
                    <div class="value">${c.telefone}</div>
                </div>
                <div class="info-item">
                    <label>Email</label>
                    <div class="value">${c.email || '-'}</div>
                </div>
                <div class="info-item">
                    <label>Status</label>
                    <div class="value"><span class="status-badge status-${c.status}">${formatStatus(c.status)}</span></div>
                </div>
                <div class="info-item">
                    <label>Endereço</label>
                    <div class="value">${c.endereco || '-'}</div>
                </div>
                <div class="info-item">
                    <label>Cidade/Estado</label>
                    <div class="value">${c.cidade}${c.estado ? '/' + c.estado : ''}</div>
                </div>
                <div class="info-item">
                    <label>Responsável</label>
                    <div class="value">${c.responsavel || '-'}${c.cargo_responsavel ? ` (${c.cargo_responsavel})` : ''}</div>
                </div>
                <div class="info-item">
                    <label>Criado em</label>
                    <div class="value">${formatDateTime(c.created_at)}</div>
                </div>
            </div>
            ${c.observacoes ? `
                <div class="info-item" style="margin-top: 15px;">
                    <label>Observações</label>
                    <div class="value">${c.observacoes}</div>
                </div>
            ` : ''}
        `;

        // Carregar interações
        await loadInteracoes(id);

        // Mostrar modal
        document.getElementById('modal-detalhes').style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showNotification('Erro ao carregar detalhes', 'error');
    }
}

async function loadInteracoes(id) {
    try {
        const response = await fetch(`${API_URL}/concessionarias/${id}/interacoes`);
        const interacoes = await response.json();

        const container = document.getElementById('interacoes-list');

        if (interacoes.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma interação registrada</p>';
            return;
        }

        container.innerHTML = interacoes.map(i => `
            <div class="interacao-item">
                <span class="tipo">${i.tipo}</span>
                <div class="data">${formatDateTime(i.data)}</div>
                <div>${i.descricao}</div>
                ${i.proximo_contato ? `<div style="margin-top: 5px;"><strong>Próximo contato:</strong> ${formatDate(i.proximo_contato)}</div>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar interações:', error);
    }
}

async function saveInteracao() {
    const data = {
        concessionaria_id: currentConcessionariaId,
        tipo: document.getElementById('tipo-interacao').value,
        descricao: document.getElementById('descricao-interacao').value,
        proximo_contato: document.getElementById('proximo-contato').value || null
    };

    try {
        const response = await fetch(`${API_URL}/interacoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Interação registrada com sucesso!', 'success');

            // Limpar formulário
            document.getElementById('form-interacao').reset();

            // Recarregar interações
            await loadInteracoes(currentConcessionariaId);

            // Atualizar dashboard
            loadDashboard();
        } else {
            const result = await response.json();
            showNotification(result.error || 'Erro ao salvar interação', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar interação:', error);
        showNotification('Erro ao salvar interação', 'error');
    }
}

function closeModal() {
    document.getElementById('modal-detalhes').style.display = 'none';
    document.getElementById('form-interacao').reset();
    currentConcessionariaId = null;
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal-detalhes');
    if (event.target === modal) {
        closeModal();
    }
};

// ==================== FILTROS ====================

function setupFilters() {
    const searchInput = document.getElementById('search');
    const filterStatus = document.getElementById('filter-status');

    // Busca com debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadConcessionarias();
        }, 500);
    });

    // Filtro de status
    filterStatus.addEventListener('change', () => {
        loadConcessionarias();
    });
}

// ==================== UTILITÁRIOS ====================

function formatStatus(status) {
    const statusMap = {
        'novo': 'Novo',
        'em_contato': 'Em Contato',
        'proposta_enviada': 'Proposta Enviada',
        'negociacao': 'Negociação',
        'fechado': 'Fechado',
        'perdido': 'Perdido'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
