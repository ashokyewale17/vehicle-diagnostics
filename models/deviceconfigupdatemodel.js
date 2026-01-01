const mongoose = require('mongoose');

const deviceConfigSchema = mongoose.Schema(  {
    device_mac: { type: String, required: true },
    device_config_ssid: { type: String, required: true },
    device_config_password: { type: String, required: true },
    device_rtc: { type: Boolean, default: false },
    device_live: { type: Boolean, default: false }
  },  { timestamps: true });

module.exports = mongoose.model('deviceConfig',deviceConfigSchema);