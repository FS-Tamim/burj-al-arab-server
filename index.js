const express=require("express");
const bodyParser=require('body-parser');
const cors=require("cors");
const admin = require('firebase-admin');

require('dotenv').config()
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
const app=express();

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o2jpm.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;
var serviceAccount = require("./configs/burj-al-arab-d41e0-firebase-adminsdk-psiue-57c6f63524.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-d41e0.firebaseio.com"
});


const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });

client.connect(err => {
  const booking = client.db("burj-al-arab").collection("bookings");
  app.post('/addbooking',(req,res)=>{
      const newBooking=req.body;
      booking.insertOne(newBooking)
      .then(result=>{
        res.send(result.insertedCount>0);

      })
    })

    app.get('/bookings',(req,res)=>{
      const bearer=req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
        const idToken=bearer.split(' ')[1];
      
        console.log({idToken});
        admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        const tokanEmail = decodedToken.email;
        console.log(tokanEmail);
        if(tokanEmail==req.query.email){
          booking.find({email: req.query.email})
          .toArray((err,document)=>{
            res.status(200).send(document);
          })
        }else{
          res.send(401).status("Un authorised Access"); 
        }
      }).catch(function(error) {
        res.send(401).status("Un authorised Access");
      });
      }else{
        res.send(401).status("Un authorised Access");
      }
     
    })
      

  
});
app.get('/', function (req, res) {
    res.send('I am tamim')
  })

app.listen(5000);