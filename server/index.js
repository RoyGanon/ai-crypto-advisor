require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("AI Crypto Advisor API is running");
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ message: "Email already exists" });
      }

      res.status(201).json({
        message: "User registered successfully",
        userId: this.lastID,
      });
    }
  );
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.post("/api/preferences", authMiddleware, (req, res) => {
  const { assets, investor_type, content_type } = req.body;
  const userId = req.user.id;

  db.run(
    `
    INSERT INTO preferences (user_id, assets, investor_type, content_type)
    VALUES (?, ?, ?, ?)
    `,
    [
      userId,
      JSON.stringify(assets),
      investor_type,
      JSON.stringify(content_type),
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to save preferences" });
      }

      res.status(201).json({
        message: "Preferences saved successfully",
        preferenceId: this.lastID,
      });
    }
  );
});

app.get("/api/preferences", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.get(
    "SELECT * FROM preferences WHERE user_id = ?",
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching preferences" });
      }

      if (!row) {
        return res.status(404).json({ message: "No preferences found" });
      }

      res.json({
        assets: JSON.parse(row.assets || "[]"),
        investor_type: row.investor_type,
        content_type: JSON.parse(row.content_type || "[]"),
      });
    }
  );
});

app.get("/api/coins", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    db.get(
      "SELECT * FROM preferences WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId],
      async (err, preferences) => {
        if (err || !preferences) {
          return res.status(404).json({ message: "Preferences not found" });
        }

        const assets = JSON.parse(preferences.assets || "[]");

        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              ids: assets.join(","),
            },
          }
        );

        res.json(response.data);
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch coins" });
  }
});

app.get("/api/news", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    db.get(
      "SELECT * FROM preferences WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId],
      async (err, preferences) => {
        if (err || !preferences) {
          return res.status(404).json({ message: "Preferences not found" });
        }

        const assets = JSON.parse(preferences.assets || "[]");
        const query = assets.length
          ? `(${assets.join(" OR ")}) AND (crypto OR cryptocurrency OR blockchain)`
          : "crypto OR bitcoin OR ethereum";

        const response = await axios.get(
          "https://newsapi.org/v2/everything",
          {
            params: {
              q: query,
              searchIn: "title,description",
              sortBy: "publishedAt",
              language: "en",
              pageSize: 5,
              apiKey: process.env.NEWS_API_KEY,
            },
          }
        );

        const formatted = response.data.articles.map((a, index) => ({
          id: index,
          title: a.title,
          url: a.url,
        }));

        res.json(formatted);
      }
    );
  } catch (err) {
    console.error("NEWS ERROR:", err.response?.data || err.message);

    res.json([
      {
        id: 1,
        title: "Crypto market update (fallback)",
        url: "https://example.com",
      },
    ]);
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});

app.get("/api/ai-insight", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    db.get(
      "SELECT * FROM preferences WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId],
      async (err, preferences) => {
        if (err || !preferences) {
          return res.status(404).json({ message: "Preferences not found" });
        }

        const assets = JSON.parse(preferences.assets || "[]");
        const investorType = preferences.investor_type;
        console.log("API KEY:", process.env.OPENROUTER_API_KEY);

        try {
          const response = await axios.post(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: "You are a crypto assistant. Give short insights only.",
      },
      {
        role: "user",
        content: `Give a short crypto insight in clean bullet points using markdown for ${investorType} interested in ${assets.join(", ")}`
      },
    ],
  },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "crypto-app",
              },
            }
          );

          return res.json({
            source: "AI",
            insight: response.data.choices[0].message.content,
          });
        } catch (aiError) {
          console.error("AI failed:", aiError.response?.data || aiError.message);

          //  fallback 
          return res.json({
            source: "fallback",
            insight: `Market is volatile. As a ${investorType}, focus on risk management and trends in ${assets.join(", ")}`,
          });
        }
      }
    );
  } catch (err) {
    return res.json({
      source: "fallback",
      insight: "Crypto market is dynamic. Stay cautious and diversified.",
    });
  }
});

const memes = [
  {
    id: "meme-1",
    title: "When Bitcoin moves 1%",
    imageUrl:
      "https://i.imgflip.com/1bij.jpg",
  },
  {
    id: "meme-2",
    title: "Crypto portfolio after checking prices",
    imageUrl:
      "https://i.imgflip.com/26am.jpg",
  },
  {
    id: "meme-3",
    title: "Me pretending I understand the market",
    imageUrl:
      "https://i.imgflip.com/30b1gx.jpg",
  },
   {
    id: "meme-4",
    title: "Buying the dip… and it dips again",
    imageUrl: "https://i.imgflip.com/4/2fm6x.jpg",
  },
  {
    id: "meme-5",
    title: "Crypto traders during a bull run",
    imageUrl: "https://i.imgflip.com/3si4.jpg",
  },
  {
    id: "meme-6",
    title: "HODL no matter what",
    imageUrl: "https://i.imgflip.com/1otk96.jpg",
  },
  {
    id: "meme-7",
    title: "Checking charts every 5 minutes",
    imageUrl: "https://i.imgflip.com/2/1bgw.jpg",
  },
  {
    id: "meme-8",
    title: "When you finally understand crypto… or not",
    imageUrl: "https://i.imgflip.com/4t0m5.jpg",
  },
  {
    id: "meme-9",
    title: "Sold too early… again",
    imageUrl: "https://i.imgflip.com/9ehk.jpg",
  },
  {
    id: "meme-10",
    title: "Market goes up after you sell",
    imageUrl: "https://i.imgflip.com/3vzej.jpg",
  },
];

app.get("/api/meme", authMiddleware, (req, res) => {
  const randomMeme = memes[Math.floor(Math.random() * memes.length)];

  res.json(randomMeme);
});

app.post("/api/votes", authMiddleware, (req, res) => {
  const { section, item_id, vote } = req.body;
  const userId = req.user.id;

  if (!section || !vote) {
    return res.status(400).json({ message: "Missing section or vote" });
  }

  if (![1, -1].includes(vote)) {
    return res.status(400).json({ message: "Vote must be 1 or -1" });
  }

  db.run(
    `
    INSERT INTO votes (user_id, section, item_id, vote)
    VALUES (?, ?, ?, ?)
    `,
    [userId, section, item_id || null, vote],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to save vote" });
      }

      res.status(201).json({
        message: "Vote saved successfully",
        voteId: this.lastID,
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});