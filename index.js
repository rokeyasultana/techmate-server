const express = require('express')
const app = express()
const cors = require('cors');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());



//mongodb
const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASS}@cluster0.xjsrqww.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT (req,res,next){
  console.log('token inside verifyJWT',req.headers.authorization);
  if(!authHeader){
    return res.send(401).send('unauthorized access');
  }
  const token = authHeader.split('')[1];
  jwt.verify( token,process.env.ACCESS_TOKEN,function(err,decoded){
    if(err){
      return res.status(403).send({message: 'forbidden access'})
    };

    req.decoded = decoded;
    next();

  });

}


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

//get bookings
app.get('/bookings',verifyJWT, async(req,res)=>{
  const email = req.query.email;
  const decodedEmail = req.decoded.email;
  if(email !== decodedEmail ){
    return res.status(403).send({message: 'forbidden access'})
  }
  const query= { email: email};
  const bookings = await bookingsCollection.find(query).toArray();
  res.send(bookings);
});

app.post ('/users',async(req,res) => {
  const user = req.body;
  console.log(user);
  const result = await usersCollection.insertOne(user)
  res.send(result);
});


//users
app.get('/users',async(req,res)=>{
  const query = {}
  const user = await usersCollection.find(query).toArray();
  res.send(user);
});

app.get('/users/:email',async(req,res)=>{
  const email = req.params.email;
  const user = await usersCollection.findOne({email:email});
  res.send(user);
})


app.get ('/users/admin/:id',async(req,res)=>{
  const email = req.params.email;
  const query = {email};
  const user = await usersCollection.findOne(query);
  res.send({isAdmin:user?.role === 'admin'})

}
)


app.put('/users/admin/:id',verifyJWT, async(req,res) => {

  const decodedEmail = req.decoded.email;
  const query = {email: decodedEmail};
  const user = await usersCollection.findOne(query);

  if(user.role !== 'admin'){
    return res.status(403).send({message:'forbidden access'})
  }
  const id = req.params.id;
  const filter = {_id:ObjectId(id)};
const options = {upsert:true};
  const updatedDoc = {
    $set:{
      role: 'admin'
    }
  }
  const result = await usersCollection.updateOne(filter,updatedDoc,options);
res.send(result);
})

//seller
app.get('/seller',async(req,res)=>{
  const seller =  await usersCollection.find({role: "seller"}).toArray();
  res.send(seller);
});



//buyers
app.get('/buyer',async(req,res) => { 
  const buyer = await usersCollection.find({role: "buyer"}).toArray()
  res.send(buyer);
});

//delete user
app.delete('/users/:id',async(req,res)=>{
  const id= req.params.id;
  const filter = {_id: ObjectId(id)};
  const result = await usersCollection.deleteOne(filter);
  res.send(result);
})

//bookings

app.get('/bookings',async(req,res)=>{
  const bookings = await bookingsCollection.find({}).toArray();
  res,send(bookings);
})

app.get('/bookings/:id',async(req,res)=>{
const id = req.params.id;
const query = {_id: ObjectId(id)};
const booking = await bookingsCollection.findOne(query);
res.send(booking);

});





//payment

app.post("/create-payment-intent", async (req, res) => {
  const booking = req.body;
const resalePrice = booking.resalePrice;
const amount= resalePrice * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    "payment_methods_types": [
"card"
    ]
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});



//jwt

app.get('/jwt',async(req,res)=>{
  const email= req.query.body;
  const query = { displayEmail:email};
  const user = await usersCollection.findOne(query);
  if(user){
    const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'1h'})
    return res.send({accessToken: token})
  }
  res.status(403).send({accessToken: ''} );
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