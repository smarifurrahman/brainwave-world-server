const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gchp2yo.mongodb.net/?retryWrites=true&w=majority`;

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
        client.connect();

        const toyCollection = client.db('brainwaveWorld').collection('toys');
        const blogCollection = client.db('brainwaveWorld').collection('blogs');

        app.post('/addToy', async (req, res) => {
            const toyInfo = req.body;
            console.log(toyInfo);
            const result = await toyCollection.insertOne(toyInfo);
            res.send(result);
        })

        app.get('/toys', async (req, res) => {

            console.log(req.query);
            let query = {};
            if (req.query?.email && req.query?.category) {
                query = { sellerEmail: req.query.email, toyCategory: req.query.category };
            }
            else if (req.query?.email) {
                query = { sellerEmail: req.query.email };
            }
            else if (req.query?.category) {
                query = { toyCategory: req.query.category };
            }

            let options = {};
            if (req.query?.sort) {
                const sort = req.query.sort;
                options = {
                    sort: {
                        'toyPrice': sort === 'asc' ? 1 : -1
                    }
                }
            }

            const cursor = toyCollection.find(query, options);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            updatedToyInfo = req.body;
            console.log(updatedToyInfo);

            const updateToy = {
                $set: updatedToyInfo,
            };
            const result = await toyCollection.updateOne(filter, updateToy);
            res.send(result);

        })

        // blogs
        app.get('/blogs', async (req, res) => {
            const result = await blogCollection.find().toArray();
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
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Brainwave World is running')
})

app.listen(port, () => {
    console.log(`Brainwave World Server is running on port ${port}`)
})