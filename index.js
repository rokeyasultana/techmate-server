const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
//mongodb
const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASS}@cluster0.xjsrqww.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// console.log(uri);

app.get('/', (req, res) => {
  res.send('Hello products resale website')
})

app.listen(port, () => {
  console.log(` Products resale website listening on port ${port}`)
})