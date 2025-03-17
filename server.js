const express = require("express")
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema for Tracking Data
const TrackingSchema = new mongoose.Schema({
  userId: String,
  latitude: Number,
  longitude: Number,
  device: String,
  ip: String,
  timestamp: { type: Date, default: Date.now },
});

const Tracking = mongoose.model("Tracking", TrackingSchema);

// API to receive location data
app.post("/api/location", async (req, res) => {
  try {
    const { userId, latitude, longitude, device, ip } = req.body;

    const trackingData = new Tracking({ userId, latitude, longitude, device, ip });
    await trackingData.save();

    io.emit("new-location", trackingData);

    res.status(201).json({ message: "Location saved", data: trackingData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(5000, () => console.log("Server running on port 5000"));
