const express = require('express');
const routes = express();
const {
    verificaTabela,
    atualizarRegistro,
    mostrarNomeTabelas,
    mostrarTabela,
    inserirRegistro,
    inserirTabela,
    excluirTabela,
    excluirRegistros,
    excluirConteudo
} = require('./src/controles');

routes.get('/api/mostrarNomeTabelas', mostrarNomeTabelas);
routes.post('/api/inserirTabela', inserirTabela);
routes.put('/api/excluirTabela', excluirTabela);

routes.put('/api/atualizarRegistro/:nomeTabela/:idRegistro', verificaTabela, atualizarRegistro);
routes.get('/api/mostrarTabela/:nomeTabela', verificaTabela, mostrarTabela);
routes.post('/api/inserirRegistro/:nomeTabela', verificaTabela, inserirRegistro);
routes.put('/api/excluirRegistros/:nomeTabela', verificaTabela, excluirRegistros);
routes.delete('/api/excluirConteudo/:nomeTabela', verificaTabela, excluirConteudo);

module.exports = { routes };
