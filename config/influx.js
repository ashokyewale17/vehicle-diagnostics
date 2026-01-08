const { InfluxDB } = require("@influxdata/influxdb-client");
require('dotenv').config();

const url = process.env.URL;
const token = process.env.TOKEN;
const org = process.env.ORG;
const bucket = process.env.BUCKET;

const influxDB = new InfluxDB({ url, token });

module.exports = {
  influxDB,
  org,
  bucket
};
