const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oikc1wt.mongodb.net/?retryWrites=true&w=majority`;

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

        const animalsCollections = client.db('toysAnimals').collection('toys')

        app.get('/AllToys', async (req, res) => {
            const result = await animalsCollections.find().toArray();
            res.send(result)
        })

        // short data
        app.get('/AllToys/data', async (req, res) => {
            const result = await animalsCollections.find().sort({ name: 1 }).limit(20).toArray();
            res.send(result)
        })
        // short by name
        app.get("/AllToys/:text", async (req, res) => {
            const text = req.params.text;
            const result = await animalsCollections
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { subCategory: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await animalsCollections.findOne(query)
            res.send(result)
        })

        app.post('/postToy', async (req, res) => {
            const body = req.body;
            const result = await animalsCollections.insertOne(body);
            res.send(result)
        })


        app.get("/myToys/:email", async (req, res) => {
            console.log(req.params.id);
            const toys = await animalsCollections
                .find({
                    sellerEmail: req.params.email,
                })
                .toArray();
            res.send(toys);
        });

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await animalsCollections.deleteOne(query)
            res.send(result)
            console.log(result);
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('toys animals is running')
})

app.listen(port, () => {
    console.log(`toys animals is running in port : ${port}`);
})