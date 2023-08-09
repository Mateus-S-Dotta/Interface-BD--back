const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { routes } = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(routes);

const port = 8000;
app.listen(port, () => {
    console.log(`Servidor Express rodando na porta ${port}`);
});
