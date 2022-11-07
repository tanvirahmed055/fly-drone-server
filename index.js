const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const serviceAccount = require("./fly-drone-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oa9tu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function verifyToken(req, res, next) {
  if (req?.headers?.authorization.startsWith("Bearer ")) {
    const token = req?.headers?.authorization.split(" ")[1];
    //console.log(token);
    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      //console.log(decodedUser);
      req.decodedUserEmail = decodedUser?.email;
    } catch {}
  }
  next();
}

async function run() {
  try {
    await client.connect();
    //database
    const database = client.db("flyXdrone_Db");
    //collections
    const usersCollection = database.collection("users");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");

    //GET API for getting all products
    app.get("/products", async (req, res) => {
      // query for products
      const query = {};

      const cursor = productsCollection.find(query);
      // print a message if no documents were found
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }

      const result = await cursor.toArray();
      res.json(result);
    });

    //GET API for getting a product
    app.get("/product", async (req, res) => {
      const productId = req.query.id;
      console.log(productId);

      // Query for a product
      const query = { _id: ObjectId(productId) };

      const product = await productsCollection.findOne(query);

      res.json(product);
    });

    //GET API for getting a userInfo
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      console.log(email);

      // Query for a user
      const query = { email: email };

      const user = await usersCollection.findOne(query);

      res.json(user);
    });

    //GET API for deleting a order
    app.delete("/deleteOrder/:id", async (req, res) => {
      const orderId = req.params.id;
      console.log(orderId);

      // Query for a order
      const query = { _id: ObjectId(orderId) };

      const result = await ordersCollection.deleteOne(query);

      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }

      res.json(result);
    });

    //GET API for deleting a product
    app.delete("/deleteProduct/:id", async (req, res) => {
      const productId = req.params.id;
      console.log(productId);

      // Query for a product

      const query = { _id: ObjectId(productId) };

      const result = await productsCollection.deleteOne(query);

      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }

      res.json(result);
    });

    //GET API for getting all orders of a specific user
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      console.log("cecking order", email);

      // Query for orders with this email
      const query = { email: email };

      const cursor = ordersCollection.find(query);

      // print a message if no documents were found
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }
      // replace console.dir with your callback to access individual elements
      const result = await cursor.toArray();

      res.json(result);
    });

    //GET API for getting all orders
    app.get("/allOrders", async (req, res) => {
      // query for products
      const query = {};

      const cursor = ordersCollection.find(query);
      // print a message if no documents were found
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }

      const result = await cursor.toArray();
      res.json(result);
    });

    //GET API for getting a specific order
    app.get("/orders/:id", async (req, res) => {
      const orderId = req.params.id;
      console.log(orderId);

      // Query for a Order
      const query = { _id: ObjectId(orderId) };

      const order = await ordersCollection.findOne(query);

      res.json(order);
    });

    //GET API for getting all reviews
    app.get("/reviews", async (req, res) => {
      // query for reviews
      const query = {};

      const cursor = reviewsCollection.find(query);
      // print a message if no documents were found
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }

      const result = await cursor.toArray();
      res.json(result);
    });

    //PUT API for storing users on database
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const userData = await usersCollection.findOne(filter);
      let updateDoc;
      if (userData) {
        updateDoc = {
          $set: {
            name: userData.name,
            email: userData.email,
            role: userData.role,
          },
        };
      } else if (!userData) {
        updateDoc = {
          $set: user,
        };
      }
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //POST API for storing orders on database
    app.post("/orders", async (req, res) => {
      const order = req.body;

      //console.log(order)

      const result = await ordersCollection.insertOne(order);

      console.log(`A document was inserted with the _id: ${result.insertedId}`);

      res.json(result);
    });

    //POST API for adding a new product on database
    app.post("/addProduct", async (req, res) => {
      const newProduct = req.body;
      //console.log(newProduct);

      const result = await productsCollection.insertOne(newProduct);

      console.log(`A document was inserted with the _id: ${result.insertedId}`);

      res.json(result);
    });

    //POST API for adding a new review on database
    app.post("/addReview", async (req, res) => {
      const newReview = req.body;
      //console.log(newReview);

      const result = await reviewsCollection.insertOne(newReview);

      console.log(`A document was inserted with the _id: ${result.insertedId}`);

      res.json(result);
    });

    //PUT API for making an user admin
    app.put("/makeAdmin", verifyToken, async (req, res) => {
      console.log("req.decodedUserEmail", req.decodedUserEmail);
      const userEmail = req.body.email;

      const requesterAccountEmail = req.decodedUserEmail;
      console.log("requesterAccountEmail", requesterAccountEmail);

      if (requesterAccountEmail) {
        const query = { email: requesterAccountEmail };
        const requsterAccount = await usersCollection.findOne(query);
        //console.log(requsterAccount.role);
        if (requsterAccount?.role === "admin") {
          // create a filter for an user to update
          const filter = { email: userEmail };
          //console.log(filter);

          // this option instructs the method to create a document if no documents match the filter
          const options = { upsert: false };
          // create a document that sets the plot of the user
          const updateDoc = {
            $set: {
              role: "admin",
            },
          };
          const result = await usersCollection.updateOne(
            filter,
            updateDoc,
            options
          );
          console.log(result);
          console.log(
            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
          );
          res.json(result);
        }
      }
    });

    //PUT API for updating order status
    app.put("/updateStatus", async (req, res) => {
      const orderId = req.body.orderId;

      // create a filter for a order to update status
      const filter = { _id: ObjectId(orderId) };
      //console.log(filter);
      // this option instructs the method to create a document if no documents match the filter
      const options = { upsert: false };
      // create a document that sets the plot of the movie

      const updateDoc = {
        $set: {
          order_status: "shipped",
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );
      res.json(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;
      const total_amount = service.total_amount;
      const converted_amount = total_amount * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: converted_amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to FlyXDrone Server!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
