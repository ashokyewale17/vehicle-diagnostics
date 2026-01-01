const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const conectDB = require('./config/db');

conectDB();

app.get('/',(req,res) => {
  res.send('API is running...');
})

app.use('/api/devices', require('./routes/devices_route'));
app.use('/api/device-configs', require('./routes/device_config_route'));


app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
}
);




