import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Sample Route
app.get("/", (req, res) => {
  res.send("Express Server is Running with ES6 Modules!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
