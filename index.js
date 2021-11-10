const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oa9tu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const collection = client.db("flyXdrone").collection("users");
    // perform actions on the collection object
    console.log(uri);
    console.log("connected to database");
});


app.get('/', (req, res) => {
    res.send('Welcome to FlyXDrone Server!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})