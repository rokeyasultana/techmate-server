const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
//mongodb
const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASS}@cluster0.xjsrqww.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
try {

  const productsCollection = client.db('products-resale').collection('products');
const bookingsCollection = client.db('products-resale').collection('bookings');
const usersCollection = client.db('products-resale').collection('users');



//get product
  app.get('/products',async(req,res)=>{
      const query = {};
      const product = await productsCollection.find(query).toArray();
      res.send(product);

  });

  //get product by id

  app.get('/products/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const  result = await productsCollection.findOne(query);
    res.send(result);
});


//bookings
app.post('/bookings', async(req,res) => {
const booking = req.body;
const result = await bookingsCollection.insertOne(booking);
res.send(result);

});

app.post ('/users',async(req,res)=>{
  const user = req.body;
  console.log(user);
  const result = await usersCollection.insertOne(user);
  res.send(result);
})
app.get('/users',async(req,res)=>{
  const query = {}
  const user = await usersCollection.find(query).toArray();
  res.send(user)
})


}



finally{

}

}

run().catch(console.log)



app.get('/', (req, res) => {
  res.send('Hello products resale website')
})

app.listen(port, () => {
  console.log(` Products resale website listening on port ${port}`)
})