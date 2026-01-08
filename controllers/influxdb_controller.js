const { influxDB, org, bucket } = require('../config/influx');


exports.getAvailableMetrics = async (req, res) => {
    try{
     
        const {measurement} = req.query;

        if (!measurement) {
        return res.status(400).json({ success: false, message: "measurement required" });
        }

        const queryApi = influxDB.getQueryApi(org);

        const fluxQuery = `
        import "influxdata/influxdb/schema"
        schema.tagValues(
            bucket: "${bucket}",
            tag: "metric",
            predicate: (r) => r._measurement == "${measurement}",
            start: -30d
        )
        `;

        const rows = await queryApi.collectRows(fluxQuery);
        const metrics = rows.map(r => r._value);

        res.json({
        success: true,
        metrics
        });

        
    }catch(err){
        res.status(500).json({message: 'Server Error', error: err.message});
    }
}


exports.getMultipleMetricsHistory = async (req, res) => {
  try {
    const { measurement, metrics, start, stop, interval = "5s" } = req.query;

    if (!measurement || !metrics || !start || !stop) {
      return res.status(400).json({ success: false, message: "Missing params" });
    }

    const metricList = metrics.split(",");

    const queryApi = influxDB.getQueryApi(org);

    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: time(v: "${start}"), stop: time(v: "${stop}"))
        |> filter(fn: (r) => r["_measurement"] == "${measurement}")
        |> filter(fn: (r) => r["_field"] == "value")
        |> filter(fn: (r) => contains(value: r["metric"], set: ${JSON.stringify(metricList)}))
        |> aggregateWindow(every: ${interval}, fn: mean, createEmpty: false)
        |> sort(columns: ["_time"])
    `;

    const rows = await queryApi.collectRows(fluxQuery);

    // Group by metric
    const result = {};

    for (const r of rows) {
      if (!result[r.metric]) result[r.metric] = [];
      result[r.metric].push({
        time: r._time,
        value: r._value
      });
    }

    res.json({
      success: true,
      series: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}



exports.getAllFieldLatestData = async (req, res) => {
  try {
    const queryApi = influxDB.getQueryApi(org);

    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -5m)
        |> filter(fn: (r) => r["_measurement"] == "${req.params.measurement}")
        |> filter(fn: (r) => r["_field"] == "value")
        |> last()
    `;

    const rows = await queryApi.collectRows(fluxQuery);

    if (!rows.length) {
      return res.json({
        success: true,
        status: "offline",
        message: "No data found in last 5 minutes",
        data: []
      });
    }

    
    const latestTimeUTC = rows
      .map(r => new Date(r._time))
      .sort((a, b) => b - a)[0];

    const now = new Date();
    const diffMs = now - latestTimeUTC;

    const OFFLINE_THRESHOLD_MS = 60 * 1000; // 60 sec
    const status = diffMs > OFFLINE_THRESHOLD_MS ? "offline" : "online";

  
    const formatted = rows.map((r) => ({
      time: r._time,
      field: r.metric,
      value: r._value
    }));

    res.json({
      status,                    
      lastSeenUTC: latestTimeUTC, 
      differenceInSeconds: Math.floor(diffMs / 1000),
      data: formatted
    });

  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}




exports.getTrips = async (req, res) => {
  try {
    const { date, measurement } = req.query;

    if (!date || !measurement) {
      return res.status(400).json({
        success: false,
        message: "date and measurement are required"
      });
    }

    const { start, stop } = getDayRange(date);
    const queryApi = influxDB.getQueryApi(org);

    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: ${start.toISOString()}, stop: ${stop.toISOString()})
        |> filter(fn: (r) => r["_measurement"] == "${measurement}")
        |> filter(fn: (r) => r["_field"] == "value")
        |> filter(fn: (r) => r["metric"] == "v10")
        |> sort(columns: ["_time"])
    `;

    const rows = await queryApi.collectRows(fluxQuery);

    if (!rows.length) {
      return res.json({
        success: true,
        totalTrips: 0,
        trips: []
      });
    }

    // Extract timestamps
    const timestamps = rows.map(r => new Date(r._time));

    const THRESHOLD_MS = 15 * 60 * 1000;

    const trips = [];
    let tripStart = timestamps[0];
    let lastTime = timestamps[0];
    let tripNumber = 1;

    for (let i = 1; i < timestamps.length; i++) {
      const currentTime = timestamps[i];
      const gap = currentTime - lastTime;

      if (gap > THRESHOLD_MS) {
        trips.push({
          tripNumber,
          startTime: formatIST(tripStart),
          endTime: formatIST(lastTime),
          durationMinutes: Math.round((lastTime - tripStart) / 60000)
        });

        tripNumber++;
        tripStart = currentTime;
      }


      lastTime = currentTime;
    }

    // Close final trip
    trips.push({
      tripNumber,
      startTime: formatIST(tripStart),
      endTime: formatIST(lastTime),
      durationMinutes: Math.round((lastTime - tripStart) / 60000)
    });


    res.json({
      success: true,
      date,
      measurement,
      totalTrips: trips.length,
      trips
    });

  } catch (err) {
    console.error("Error fetching trip data:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

function formatIST(date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}


function getDayRange(dateStr) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const stop = new Date(start);
  stop.setUTCDate(stop.getUTCDate() + 1);

  return { start, stop };
}

