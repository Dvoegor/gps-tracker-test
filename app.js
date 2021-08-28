const express = require('express');
const moment = require('moment');
const knex = require('knex')({
  client: 'pg',
  connection: {
    user: 'grigorijdvoeglazov',
    host: 'localhost',
    database: 'grigorijdvoeglazov',
    password: '',
    port: 5432,
  },
});

const app = express();
const PORT = 3000;

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});