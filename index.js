const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.adps5.mongodb.net/volunteerdb?retryWrites=true&w=majority`;
const port = 5000



const  serviceAccount = require("./configs/volunteer-network-project1-firebase-adminsdk-7tsyd-c9b4fe1496.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB_URL
});




const app = express();
app.use(cors());
app.use(bodyParser.json());




const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true  });
client.connect(err => {
  const events = client.db("volunteerdb").collection("events");
    
  app.post('/addEvent', (req, res) => {
    const newEvents = req.body;
    events.insertOne(newEvents)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newEvents);
  })


  app.get('/events', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      
      admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
        console.log({tokenEmail, queryEmail});
        if (tokenEmail == queryEmail) {
           events.find({email: queryEmail})
            .toArray((err, documents) => {
            res.status(200).send(documents);
    })
        }
        else {
          res.status(401).send('unauthorized Access');
        }

      }).catch(function(error) {
        res.status(401).send('unauthorized Access');
      });
    } else {
      res.status(401).send('unauthorized Access');
    }
   
  })

  app.get("/allEvents", function (req, res) {
    events.find({})
      .toArray((error, documents) => {
        res.send(documents);
    })
  })

  app.delete("/delete/:id", function (req, res) {
    events.deleteOne({_id: ObjectId(req.params.id) })
      .then(result => {
        console.log(result);
    })
  })
  
  app.delete("/deleteall/:id", function (req, res) {
    events.deleteOne({_id: ObjectId(req.params.id) })
      .then(result => {
        console.log(result);
    })
})
  
});


app.listen(process.env.PORT || port);

  