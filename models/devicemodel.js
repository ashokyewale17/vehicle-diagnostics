const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({

    device_mac : {type: String, required: true},
    device_vcu : {type: String, required: true},
    device_ssid : {type: String, required: true},
    device_pass : {type: String, required: true}

},
{ timestamps: true });

module.exports = mongoose.model('device_detail',deviceSchema);