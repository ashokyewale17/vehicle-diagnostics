const deviceConfigModel = require('../models/deviceconfigupdatemodel');

exports.createNewUpdateDeviceConfig = async (req,res) => {

    try{

        // check if devie with same mac already exist if yes then remove it and add new one
        const existingConfig = await deviceConfigModel.findOne({ device_mac: req.body.device_mac });

        if(existingConfig){
            await deviceConfigModel.deleteOne({ device_mac: req.body.device_mac });
        }

        const newDeviceConfig = new deviceConfigModel(req.body);
        await newDeviceConfig.save();
        res.status(201).json(newDeviceConfig);

    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}

exports.getDeviceConfigsByMac = async (req, res) => {
    try{

        // Get device configs by mac only one record

        const deviceMac = req.params.mac;
        const deviceConfig = await deviceConfigModel.findOne({ device_mac: deviceMac }).sort({ createdAt: -1 });
        if(!deviceConfig){
            return res.status(404).json({message: 'No Configs Found for this Device MAC'});
        }
        res.status(200).json(deviceConfig);

    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}

exports.checkUpdateNeededByMac = async (req, res) => {
    try{

        // Check if update is needed for device by mac by checking wheater its record exists or not

        const deviceMac = req.params.mac;
        const deviceConfig = await deviceConfigModel.findOne({ device_mac: deviceMac });
        if(deviceConfig){
            return res.status(200).json({ updateNeeded: true });
        }
        res.status(200).json({ updateNeeded: false });

    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}

exports.deleteDeviceConfigsAndMakeChangesPermanantByMac = async (req, res) => {

    try{

        // Delete device configs by mac and before that update the ssid and password in the main device model to make changes permanant and remove from the configs table
        const deviceMac = req.params.mac;
        const deviceConfig = await deviceConfigModel.findOne({ device_mac: deviceMac }).sort({ createdAt: -1 });
        if(!deviceConfig){
            return res.status(404).json({message: 'No Configs Found for this Device MAC'});
        }
        const DeviceModel = require('../models/devicemodel');

        await DeviceModel.findOneAndUpdate(
            { device_mac: deviceMac },
            {
                device_ssid: deviceConfig.device_config_ssid,
                device_pass: deviceConfig.device_config_password
            }
        );
        await deviceConfigModel.deleteOne({ device_mac: deviceMac });
        res.status(200).json({message: 'Device Config Deleted Successfully'});

    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }

}

exports.deleteOnlyDeviceConfigByMac = async (req, res) => {
    try{

        // Delete only one device config by mac without making changes permanant
        
        const deviceMac = req.params.mac;
        const deviceConfig = await deviceConfigModel.findOne({ device_mac: deviceMac });
        if(!deviceConfig){
            return res.status(404).json({message: 'No Configs Found for this Device MAC'});
        }
        await deviceConfigModel.deleteOne({ device_mac: deviceMac });
        res.status(200).json({message: 'Device Config Deleted Successfully'});
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }

}