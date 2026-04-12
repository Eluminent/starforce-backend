import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const app = express();

app.use(cors());
app.use(express.json());

// In-memory user storage (for demonstration purposes only)
const users = [];



//Limit number of user requests
const limiter = rateLimit({
  windowMs: 1000*60, //1 min
  max: 10, //Limit IP to 10 requests
  message: "Too many requests, please try again later."
});



// Register
async function register(request, result) {
  const {username, password} = request.body;

  if (!username || !password) {
    return result.status(400).send("Username and password required.");
  }

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return result.status(400).send("User exists already!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    username,
    password: hashedPassword,
  })

  result.json({message: "User registered!"});
}



//login
async function login(req, res) {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(400).send("User not found");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).send("Invalid password");
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
}


app.post("/register", register);
app.post("/login", limiter, login);

app.get("/profile", authMiddleware, (request, response) => {
  response.json({
    message: "You have been authenticated!",
    user: request.user
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});