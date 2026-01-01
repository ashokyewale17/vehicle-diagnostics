const express = require('express');
const router = express.Router();

const {getAvailableMetrics,getMultipleMetricsHistory,getAllFieldLatestData,getTrips} = require('../controllers/influxdb_controller');

router.get('/metrics',getAvailableMetrics);
router.get('/history',getMultipleMetricsHistory);
router.get('/tripshistory', getTrips);
router.get('/latestdata/:measurement', getAllFieldLatestData);
module.exports = router;