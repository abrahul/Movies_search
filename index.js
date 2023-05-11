import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.uri;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to the database");

    const database = client.db("sample_mflix");
    const collection = database.collection("movies");

    // All movies route
    app.get("/movies", async (req, res) => {
      try {
        const result = await collection.find({}).toArray();
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });

    // Search route
    app.get("/search", async (req, res) => {
      const query = req.query.q;

      const searchQuery = {
        title: { $regex: `\\b${query}\\b`, $options: "i" },
      };
      const projection = {
        _id: 0,
        title: 1,
        plot: 1,
      };

      try {
        const cursor = collection.find(searchQuery, { projection });
        const result = await cursor.toArray();

        res.json(result);
      } catch (err) {
        console.error("Error during search:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Start the server
    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  } catch (err) {
    console.error(err);
    await client.close();
  }
}

run().catch(console.dir);
