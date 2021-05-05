const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfj8i.mongodb.net/burjAlArab?retryWrites=true&w=majority`;



require('dotenv').config()

const port =process.env.PORT || 5000

const app = express()

app.use(cors());
app.use(bodyParser.json());



// var admin = require("firebase-admin");

var serviceAccount = require("./configs/burj-al-arab23-firebase-adminsdk-m4xxe-0671312ec9.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("booking");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        // console.log(newBooking)
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // console.log({ idToken });
            admin.auth().verifyIdToken(idToken).then((decodedToken) => {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;
                // console.log(tokenEmail,queryEmail)
                if(tokenEmail === queryEmail){
                    bookings.find({email:queryEmail})
                    .toArray((err,documents) => {
                        res.status(200).send(documents);
                    })
                }
                else{
                    res.status(401).send('un_authorized access')
                }

            }).catch((error) => {
                res.status(401).send('un_authorized access')
                });
        }
        else{
            res.status(401).send('un_authorized access')
        }
 
    })
})

// });




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)