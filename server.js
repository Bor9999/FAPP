const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

let readDataGenralData = fs.readFileSync("database/data0.json");
let generalDataRaw = JSON.parse(readDataGenralData);
let readDataDetaildata = fs.readFileSync("database/data1.json");
let detailDataRaw = JSON.parse(readDataDetaildata);

let preloadAllDetail = detailDataRaw.reduce((acc, el) => {
  let key = el.wh_id;
  acc[key] = acc[key]
    ? [...acc[key], { x: el.dt_date, y: el.qty }]
    : [{ x: el.dt_date, y: el.qty }];
  return acc;
}, {});

// устанавливаем обработчик для маршрута "/"
app.get("/general", function (request, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json"); //В моем случае я получаю json
  res.setHeader("Access-Control-Allow-Origin", "*"); //Либо конкретный хост (поддерживается группа в виде массива)
  res.setHeader(
    //Необходимые типы запросов
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true); //Означает, что должен быть получен ответ
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Пошло хрючево
  res.send(JSON.stringify(generalDataRaw));
});
app.get("/detail", function (request, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  console.log(request.query);
  // Пошло хрючево
  let detail;

  if (request.query.id != "all") {
    if (request.query.date_start && request.query.date_end) {
      // let start = new Date(request.query.date_start);
      // let end = new Date(request.query.date_end);
      // let key = request.query.id;
      // detail = preloadAllDetail[key].reduce((acc, el) => {
      //   let date = new Date(el.dt_date);

      //   if (el.wh_id == key && date >= start && date <= end) {
      //     acc = [...acc, { x: el.dt_date, y: el.qty }];
      //   }
      //   return acc;
      // }, []);
      let start = new Date(request.query.date_start);
      let end = new Date(request.query.date_end);
      let key = request.query.id;
      detail = preloadAllDetail[key].reduce((acc, el) => {
        let date = new Date(el.x);
        if (date >= start && date <= end) {
          acc = [...acc, el];
        }
        return acc;
      }, []);
    } else {
      let key = request.query.id;
      detail = preloadAllDetail[key];
    }
  } else {
    if (request.query.date_start && request.query.date_end) {
      let start = new Date(request.query.date_start);
      let end = new Date(request.query.date_end);
      detail = detailDataRaw.reduce((acc, el) => {
        let date = new Date(el.dt_date);
        let key = el.wh_id;
        if (date >= start && date <= end) {
          acc[key] = acc[key]
            ? [...acc[key], { x: el.dt_date, y: el.qty }]
            : [{ x: el.dt_date, y: el.qty }];
        }
        return acc;
      }, {});
    } else {
      detail = preloadAllDetail;
    }
  }

  res.send(JSON.stringify(detail));
});

app.use(cors());
app.listen(8080);
