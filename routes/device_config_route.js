const express = require('express');
const router = express.Router();

const { createNewUpdateDeviceConfig, getDeviceConfigsByMac, checkUpdateNeededByMac, deleteDeviceConfigsAndMakeChangesPermanantByMac,deleteOnlyDeviceConfigByMac  } = require('../controllers/device_config_controller');

// Route to update device configuration

router.post('/', createNewUpdateDeviceConfig);
router.get('/get-configs/:mac', getDeviceConfigsByMac);
router.get('/check-update/:mac', checkUpdateNeededByMac);
router.delete('/done-update/:mac', deleteDeviceConfigsAndMakeChangesPermanantByMac);
router.delete('/delete-configs/:mac', deleteOnlyDeviceConfigByMac);

module.exports = router;