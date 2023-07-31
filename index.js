const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());
  

//mongodb username and password
//Username: codersot
//password: oY6RkdFkiMZjIvn3

//mongodb code from mongodb


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@codersot.pqlnaow.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const CoursesCollection = client.db("bbahub").collection("Courses");

    app.get('/Courses', async(req,res) =>{
      const result = await CoursesCollection.find().toArray();
      res.send(result);
    });

    const reviewsCollection = client.db("bbahub").collection("Reviews");

    app.get('/Reviews', async(req,res) =>{
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);





app.get('/', (req, res) => {
    res.send('BBA hub db is running ')
})


app.listen(port, () => {
    console.log(` BA hub db is coming on port ${port}`);
})