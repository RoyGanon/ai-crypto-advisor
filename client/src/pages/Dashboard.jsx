import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api";

function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [news, setNews] = useState([]);
  const [ai, setAi] = useState("");
  const [meme, setMeme] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coinsRes, newsRes, aiRes, memeRes] = await Promise.all([
        api.get("/coins"),
        api.get("/news"),
        api.get("/ai-insight"),
        api.get("/meme"),
      ]);

      setCoins(coinsRes.data);
      setNews(newsRes.data);
      setAi(aiRes.data.insight);
      setMeme(memeRes.data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  const sendVote = async (section, itemId, vote) => {
    try {
      await api.post("/votes", {
        section,
        item_id: itemId,
        vote,
      });

      alert("Vote saved!");
    } catch (err) {
      console.error("Vote failed");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AI Crypto Advisor</h1>
        <p>Welcome {user?.name || "Investor"} 👋     
            <button className="vote-btn" onClick={() => {
         localStorage.clear();
       window.location.href = "/login";
      }}>
    Logout
    </button></p>
      </div>

      <div className="grid">
        <div className="card">
          <h2>💰 Coin Prices</h2>
          {coins.map((coin) => (
            <div className="item" key={coin.id}>
              <strong>{coin.name}</strong>: ${coin.current_price}
              <button className="vote-btn" onClick={() => sendVote("coins", coin.id, 1)}>👍</button>
              <button className="vote-btn" onClick={() => sendVote("coins", coin.id, -1)}>👎</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>📰 Market News</h2>
          {news.map((n) => (
            <div className="item" key={n.id}>
              <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>
              <button className="vote-btn" onClick={() => sendVote("news", n.id, 1)}>👍</button>
              <button className="vote-btn" onClick={() => sendVote("news", n.id, -1)}>👎</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>🤖 AI Insight</h2>
          <ReactMarkdown>{ai}</ReactMarkdown>
          <button className="vote-btn" onClick={() => sendVote("ai", "daily", 1)}>👍</button>
          <button className="vote-btn" onClick={() => sendVote("ai", "daily", -1)}>👎</button>
        </div>

        <div className="card">
          <h2>😂 Crypto Meme</h2>
          {meme && (
            <>
              <p>{meme.title}</p>
              <img className="meme-img" src={meme.imageUrl} alt={meme.title} />
              <br />
              <button className="vote-btn" onClick={() => sendVote("meme", meme.id, 1)}>👍</button>
              <button className="vote-btn" onClick={() => sendVote("meme", meme.id, -1)}>👎</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;