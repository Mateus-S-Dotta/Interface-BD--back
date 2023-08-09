const knex = require('./conexaoBD');

function respostaCatch(res, error) {
    console.error('Erro ao executar esta ação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
};

const verificaTabela = async (req, res, next) => {
    const { nomeTabela } = req.params;
    try {
        const tabelaExiste = await knex.schema.hasTable(nomeTabela);
        if (!tabelaExiste) {
            return res.status(404).json({ message: 'A tabela não foi encontrada.' });
        }
        next();
    } catch (error) {
        return respostaCatch(res, error);
    }
};

module.exports = { verificaTabela, respostaCatch };