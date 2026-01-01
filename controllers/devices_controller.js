const deviceModel = require('../models/devicemodel');

exports.getAllDevices = async (req,res) => {
    try{

        const devices = await deviceModel.find();
        res.status(200).json(devices);

    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}

exports.getDeviceByVCUID = async (req,res) => {
    try{
        const vcuid = req.params.vcuid;
        const device = await deviceModel.findOne({ device_vcuid: vcuid });
        if(!device){
            return res.status(404).json({message: 'Device Not Found'});
        }
        res.status(200).json(device);
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}

exports.createDevice = async (req,res) => {
    try{

        const newDevice = new deviceModel(req.body);
        await newDevice.save();
        res.status(201).json(newDevice);

    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}

exports.updateDevice = async (req,res) => {
    try{
        const updatedDevice = await deviceModel.findByIdAndUpdate(req.params.id,req.body,{new:true});
        res.status(200).json(updatedDevice);
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}

exports.deleteDevice = async (req,res) => {
    try{
        await deviceModel.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Device deleted successfully'});
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}