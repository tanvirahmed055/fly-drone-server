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



async function run() {
    try {
        await client.connect();
        const database = client.db("flyXdrone_Db");
        const usersCollection = database.collection("users");
        const productsCollection = database.collection("products");


        //GET API for getting all products
        app.get('/products', async (req, res) => {
            // query for products
            const query = {};

            const cursor = productsCollection.find(query);
            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }

            const result = await cursor.toArray();
            res.json(result);
        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to FlyXDrone Server!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})