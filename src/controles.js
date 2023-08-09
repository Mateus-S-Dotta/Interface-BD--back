const knex = require('./conexaoBD');
const { verificaTabela, respostaCatch } = require('./utilsEMiddlewar');

const atualizarRegistro = async (req, res) => {
    const { nomeTabela, idRegistro } = req.params;
    const novosDados = req.body;
    try {
        const numRegistrosAtualizados = await knex(nomeTabela)
            .where('id', idRegistro)
            .update(novosDados);
        if (numRegistrosAtualizados === 0) {
            return res.status(404).json({ message: 'O registro não foi encontrado.' });
        }
        return res.status(200).json({ message: 'Registro atualizado com sucesso!' });
    } catch (error) {
        return respostaCatch(res, error);
    }
};

const mostrarNomeTabelas = async (req, res) => {
    try {
        const listaTabelas = await knex('pg_catalog.pg_tables')
            .select('tablename as nome')
            .where('schemaname', 'public');
        for (const tabela of listaTabelas) {
            const result = await knex.raw(`SELECT COUNT(*) FROM "${tabela.nome}"`);
            tabela.totalRegistros = parseInt(result.rows[0].count);
        }
        for (const tabela of listaTabelas) {
            const colunas = await knex('information_schema.columns')
                .select('*')
                .where({
                    table_name: tabela.nome,
                    table_schema: 'public'
                });
            tabela.colunas = colunas.map((coluna) => ({ nome: coluna.column_name, tipo: coluna.data_type }));
        }
        return res.status(200).json(listaTabelas);
    } catch (error) {
        return respostaCatch(res, error);
    }
};

const mostrarTabela = async (req, res) => {
    const { nomeTabela } = req.params;
    const { colunaOrdenacao, ordem } = req.query;
    try {
        let query = knex(nomeTabela).select('*');
        if (colunaOrdenacao && ordem) {
            const colunaExiste = await knex.schema.hasColumn(nomeTabela, colunaOrdenacao);
            if (colunaExiste) {
                query = query.orderBy(colunaOrdenacao, ordem);
            } else {
                return res.status(400).json({ message: 'A coluna de ordenação não existe na tabela.' });
            }
        }
        const registros = await query;
        return res.status(200).json(registros);
    } catch (error) {
        return respostaCatch(res, error);
    }
};

const inserirRegistro = async (req, res) => {
    const { nomeTabela } = req.params;
    const dadosInsercao = req.body;
    try {
        const resultado = await knex(nomeTabela).insert(dadosInsercao);
        return res.status(201).json({ message: 'Dados inseridos com sucesso!', resultado });
    } catch (error) {
        return respostaCatch(res, error);
    }
};

const inserirTabela = async (req, res) => {
    const { nomeTabela, colunas } = req.body;
    try {
        const tabelaExiste = await knex.schema.hasTable(nomeTabela);
        if (tabelaExiste) {
            return res.status(400).json({ message: 'A tabela já existe.' });
        }
        await knex.schema.createTable(nomeTabela, (table) => {
            table.increments('id').primary();
            colunas.forEach((coluna) => {
                table[coluna.tipo](coluna.nome);
            });
        });
        return res.status(201).json({ message: `Tabela ${nomeTabela} criada com sucesso!` });
    } catch (error) {
        return respostaCatch(res, error);
    }
};

const excluirTabela = async (req, res) => {
    const { tabelasParaExcluir } = req.body;
    if (!tabelasParaExcluir || !Array.isArray(tabelasParaExcluir) || tabelasParaExcluir.length === 0) {
        return res.status(400).json({ message: 'Informe uma lista válida de tabelas a serem excluídas.' });
    }

    try {
        await knex.transaction(async (trx) => {
            for (const tabelaParaExcluir of tabelasParaExcluir) {
                await trx.schema.dropTableIfExists(tabelaParaExcluir);
            }
        });
        res.json({ message: 'As tabelas foram excluídas com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir tabelas:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao excluir as tabelas.' });
    }
};

const excluirRegistros = async (req, res) => {
    const { nomeTabela } = req.params;
    const { idsRegistros } = req.body;
    try {
        const registroExcluido = await knex(nomeTabela)
            .whereIn('id', idsRegistros)
            .del();
        return res.status(200).json({ message: `${registroExcluido} registros excluídos com sucesso!` });
    } catch (error) {
        return respostaCatch(res, error);
    }
};

const excluirConteudo = async (req, res) => {
    const { nomeTabela } = req.params;
    try {
        await knex(nomeTabela).truncate();
        return res.status(200).json({ message: `Conteúdo da tabela ${nomeTabela} excluído com sucesso!` });
    } catch (error) {
        return respostaCatch(res, error);
    }
};

module.exports = {
    verificaTabela,
    atualizarRegistro,
    mostrarNomeTabelas,
    mostrarTabela,
    inserirRegistro,
    inserirTabela,
    excluirTabela,
    excluirRegistros,
    excluirConteudo
};