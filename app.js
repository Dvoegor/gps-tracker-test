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
/* 
  Ниже представлены названия таблицы БД и ее столбцы с их типами
*/
// gps_coordinates
// id int,
// latitude float4,
// longitude float4,
// created_at timestamp default now()

const app = express();
const PORT = 3000;

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

/* 
  На этот эндпоинт мы принимаем ID пользователя и его текущие GPS координаты,
  распарсиваем их и все данные записываем в БД.
*/
// {
//   "userId": "1",
//   "gps": "40.741895,-73.989308"
// }
app.post('/send-gps-data', (req, res) => {
  const userId = req.body.userId;
  const gpsArr = req.body.gps.split(',');
  const latitude = gpsArr[0];
  const longitude = gpsArr[1];
  knex('gps_coordinates')
    .insert({ id: userId, latitude: latitude, longitude: longitude })
    .then(() => {
      res.status(200).send('Data is sent');
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

/* 
  На этот эндпоинт мы принимаем ID пользователя и даты (начальная и конечная).
  Делаем поиск в БД по ID пользователя и датам, предварительно проверив, что они были переданы.
  В ответ отдаем результаты поиска - GPS координаты.
*/
// get-gps-data?userId=1&startDate=2021-08-27&endDate=2021-08-29
app.get('/get-gps-data', (req, res) => {
  const userId = req.query.userId;
  const startDate = req.query.startDate
    ? moment(req.query.startDate).format()
    : false;
  const endDate = req.query.endDate
    ? moment(req.query.endDate).format()
    : false;
  knex('gps_coordinates')
    .select('latitude', 'longitude')
    .where('id', userId)
    .modify(function (queryBuilder) {
      if (startDate) {
        queryBuilder.where('created_at', '>=', startDate);
      }
    })
    .modify(function (queryBuilder) {
      if (endDate) {
        queryBuilder.where('created_at', '<=', endDate);
      }
    })
    .then((data) => {
      const gpsArr = data.map((i) => {
        return { gps: `${i.latitude},${i.longitude}` };
      });
      res.status(200).send(gpsArr);
      /* 
      Output:
      */
      // [
      //   {
      //       "gps": "40.741894,-73.98931"
      //   },
      //   {
      //       "gps": "40.741894,-73.98931"
      //   }
      // ]
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});
