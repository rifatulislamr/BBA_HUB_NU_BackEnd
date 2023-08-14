const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


// Multer setups
const storage = multer.diskStorage ({
  destination: function (req , file , cb){
    if(!fs.existsSync('public')){
      fs.mkdirSync("public");
    }
    if(!fs.existsSync("public/videos")){
      fs.mkdirSync("public/videos");
    }
    cb(null,"public/videos");
  },
  filename: function(req,file,cb){
    cb(null, Date.now()+ file.originalname);
  }
})

const upload = multer({
  storage: storage,fileFilter: function(req,file,cb){
    let ext  = path.extname(file.originalname);

    if(ext !== ".mkv" && ext !== ".mp4"){
      return cb(new Error("Only videos are allowed"));
    }
    cb(null,true);
  }
})


// middleware
app.use(cors());
app.use(express.json());



const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access haha ' });
  }

  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access bal' })
    }
    req.decoded = decoded;
    next();

  })
}



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
    const reviewsCollection = client.db("bbahub").collection("Reviews");
    const userCollection = client.db("bbahub").collection("users");
    const videoCollection = client.db('bbahub').collection('videos');

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })


    // warning: use verifyJWT before using verification 
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    }


    /**
     * 0. do not show secure links to those who should not see the links
     * 1. use jwt token : verifyJWT
     * 2.use verifyAdmin middleware
     * 
     */



    // users related api
    app.get('/users', verifyJWT,verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })




    app.post('/users', async (req, res) => {
      const user = req.body;
      // console.log(user)
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      // console.log('existing user' , existingUser);
      if (existingUser) {
        return res.send({ message: 'user already exist' })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //security layer: verifyJWT 
    //email same 
    // check admin 

    app.get('/users/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ admin: false });
      }

      const query = { email: email }
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
      res.send(result);
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {

        $set: {

          role: 'admin'

        },

      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);

    })




    //get courses apis collection here
    app.get('/Courses', async (req, res) => {
      const result = await CoursesCollection.find().toArray();
      res.send(result);
    });


    // get reviews collection apis
    app.get('/Reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })


    // Get all videos from backend
      app.get('/videos/all', async (req, res) => {
        const allVideos = await videoCollection.find().toArray();
        res.send(allVideos);
      });


      // Post courses to backend
      app.post('/videos/upload',upload.fields([
        {
          name: "videos", 
          maxCount:5,
        }
      ]),async (req, res) => {
        console.log("hitted in api");
       const {name} = req.body;
       let videosPaths = [];

       if(Array.isArray(req.files.videos)&& req.files.videos.length > 0){
        for(let video of req.files.videos){
          videosPaths.push("/" + video.path);
        }
       }

       try{
        const createdMedia = await videoCollection.insertOne({
          name,
          videos: videosPaths,
        })
        
        res.json({message: "Media created successfully", createdMedia})
      
       }
       catch(err){
        console.log(err);
        res.status(400).json(err);
       }
        // const result = await videoCollection.insertOne(video);
        // res.send(result);
      });

 


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
