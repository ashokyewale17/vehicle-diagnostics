const express = require('express');
const router = express.Router();

const { getAllDevices,createDevice,updateDevice,deleteDevice,getDeviceByVCUID } = require('../controllers/devices_controller');

// Route to get all devices

router.get('/', getAllDevices);
router.get('/:vcuid', getDeviceByVCUID);
router.post('/', createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);

module.exports = router;