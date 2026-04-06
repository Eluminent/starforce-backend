import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();

app.use(cors());
app.use(express.json());

// In-memory user storage (for demonstration purposes only)
const users = [];

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    username,
    password: hashedPassword
  });

  res.json({ message: "User registered" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).send("User not found");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).send("Invalid password");
  }

  const token = jwt.sign({ username }, "secretkey");

  res.json({ token });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});