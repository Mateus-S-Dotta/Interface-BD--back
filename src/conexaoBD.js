const knex = require('knex')({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'adottado',
        database: 'teste'
    }
});

module.exports = knex;