require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llrud.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("movieDB");
    const movieCollection = database.collection("movies");

    const favoriteMoviesCollection = database.collection("favoriteMovies");
    //----------------MOVIES---------------------
    app.get("/movies", async (req, res) => {
      try {
        const cursor = movieCollection.find().limit(6);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });
    app.get("/allMovies", async (req, res) => {
      const { searchParams } = req.query;
      let option = {};
      if (searchParams) {
        option = { title: { $regex: searchParams, $options: "i" } };
      }
      const cursor = movieCollection.find(option);
      const result = await cursor.toArray();
      res.send(result);
    });
    //----------------MOVIES---------------------
    app.get("/movie/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await movieCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // ---------------POST MATHOD-----------------------
    app.post("/movies", async (req, res) => {
      try {
        const movie = req.body;
        const result = await movieCollection.insertOne(movie);
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // -----------------MY--FAVORITE--MOVIE----------------
    app.get("/favoriteMovies", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { userEmail: email };
        const result = await favoriteMoviesCollection.find(query).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // ----------------------POST--METHOD-------------
    app.post("/favoriteMovies", async (req, res) => {
      try {
        const favorite = req.body;
        // console.log(favorite);
        const result = await favoriteMoviesCollection.insertOne(favorite);
        console.log(result);
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // ---------------UPDATE--MOVIE-------------------
    app.patch("/updateMovie/:id", async (req, res) => {
      const id = req.params.id;
      const movie = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateMovie = {
        $set: {
          email: movie.email,
          moviePoster: movie.moviePoster,
          title: movie.title,
          genre: movie.genre,
          duration: movie.duration,
          releaseYear: movie.releaseYear,
          summary: movie.summary,
        },
      };
      const result = await movieCollection.updateOne(
        filter,
        updateMovie,
        option
      );
      res.send(result);
    });

    // --------------------DELETE---------------------------
    app.delete("/movies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: id };
        const result = await favoriteMoviesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        error.message;
      }
    });
    // ---------------DELETE--FAVORITE-----------------------

    app.delete("/favoriteMovies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: id };
        const result = await favoriteMoviesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        error.message;
      }
    });
    // ---------------------DELETE--FAVORITE--------------------
  } catch (error) {
    error.message;
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("🎬 Movie Review Server is Running...");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
