const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const nodemailer = require("nodemailer");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const port = process.env.PORT || 8000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 
    'http://localhost:5174',
    'https://stayvista-starter-9f4b2.web.app',
    'https://stayvista-starter-9f4b2.firebaseapp.com',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

// Send email
const sendEmail = (emailAddress, emailData) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.TRANSPORTER_EMAIL,
      pass: process.env.TRANSPORTER_PASS,
    },
  })

  // Verify transporter
  transporter.verify(function (error, success){
    if(error){
      console.log(error)
    }
    else{
      console.log('Server is ready to take our message')
    }
  })

  const mailBody = {
    from: `"StayVista" <${process.env.TRANSPORTER_EMAIL}>`,
    to: emailAddress,
    subject: emailData.subject,
    html: emailData.message,
  }

  transporter.sendMail(mailBody, (error, info) => {
    if(error){
      console.log(error)
    }
    else{
      console.log('Email Sent:' + info.response)
    }
  })
}

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  console.log(token)
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@main.mq0mae1.mongodb.net/?retryWrites=true&w=majority&appName=Main`
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bgilkf0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const db = client.db('stayvista')
    const roomsCollection = db.collection('rooms')
    const usersCollection = db.collection('users')
    const bookingsCollection = db.collection('booking')

    // Verify admin tokens
    const verifyAdmin = async (req, res, next) => {
      const user = req.user 
      const query = {email: user?.email}
      const result = await usersCollection.findOne(query)
      if(!result || result?.role !== 'admin')
        return res.status(401).send({message: 'Unauthorized access'})
      next()
    }
    // Verify Host tokens
    const verifyHost = async (req, res, next) => {
      const user = req.user 
      const query = {email: user?.email}
      const result = await usersCollection.findOne(query)
      if(!result || result?.role !== 'host')
        return res.status(401).send({message: 'Unauthorized access'})
      next()
    }

    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })
    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
        console.log('Logout successful')
      } catch (err) {
        res.status(500).send(err)
      }
    })

       // create-payment-intent
    app.post('/create-payment-intent', verifyToken, async (req, res) => {
      const price = req.body.price
      const priceInCent = parseFloat(price) * 100
      if (!price || priceInCent < 1) return
      // generate clientSecret
      const { client_secret } = await stripe.paymentIntents.create({
        amount: priceInCent,
        currency: 'usd',
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      })
      // send client secret as response
      res.send({ clientSecret: client_secret })
    })


    // Save a user data in db
    app.put('/user', async (req, res) => {
      const user = req.body
      const query = {email: user?.email}
      // cheek if user already exists in db
      const isExist = await usersCollection.findOne(query)
      if(isExist) {
        if(user.status === 'Requested'){
          const result = await usersCollection.updateOne(query, {
            $set: {status: user?.status}
          })
          return res.send(result)
        }else{
          return res.send(isExist)
        }
      }
    // Save user for the first time
      const options = {upsert: true}
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      }
      const result = await usersCollection.updateOne(query, updateDoc, options)
      // Welcome new user
      sendEmail(user?.email, {
        subject: 'Welcome to StayVista!',
        message: `Hope you will find you destination`
      })

      res.send(result) 
    })

    // get a user info by email from db
    app.get('/user/:email', async (req, res) =>{
      const email = req.params.email 
      const result = await usersCollection.findOne({email})
      res.send(result)
    })

    // get all users data from db
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    // update a user role 
    app.patch('/users/update/:email',  async (req, res) =>{
      const email = req.params.email 
      const user = req.body 
      const query = {email}
      const updateDoc = {
        $set: {...user, timestamp: Date.now()},
      }
      const result = await usersCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    // get all rooms form db
    app.get('/rooms', async (req, res) =>{
      const category  = req.query.category  
      let query = {}
      if (category && category !== 'null') query = { category}
      const result = await roomsCollection.find(query).toArray()
      res.send(result);
    })

    // Get a single room form db using _id
    app.get('/room/:id', async (req, res) =>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await roomsCollection.findOne(query)
      res.send(result);
    })

    // Save a room data in db using dashboard form
    app.post('/room', verifyToken, verifyHost, async (req, res) => {
      const roomData = req.body 
      const result = await roomsCollection.insertOne(roomData)
      res.send(result)
    })

    // Delete a room
    app.delete('/room/:id', verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await roomsCollection.deleteOne(query)
      res.send(result)
    })

    // get all rooms for host
    app.get('/my-listings/:email', verifyToken, verifyHost, async (req, res) => {
      const email = req.params.email 
      let query = {'host.email': email}
      const result = await roomsCollection.find(query).toArray()
      res.send(result)
    })

     // Save a bookings data in db using dashboard form
     app.post('/booking', verifyToken, async (req, res) => {
      const bookingData = req.body 
      // save room availability status
      const result = await bookingsCollection.insertOne(bookingData)
     
      // send email to guest
      sendEmail(bookingData?.guest?.email, {
        subject: 'Booking Successful!',
        message: `You've successfully booked a room through StayVista.
        Transaction Id: ${bookingData.transactionId}
        `
      })
      // send email to host
      sendEmail(bookingData?.host?.email, {
        subject: 'Your room got booked!',
        message: `Get ready to welcome ${bookingData.guest.name}`,
      })

      // // change room availability status
      // const roomId = bookingData.roomId
      // const query = {_id: new ObjectId(roomId)}
      // const updateDoc = {
      //   $set: {booked: true},
      // }
      // const updateRoom = await roomsCollection.updateOne(query, updateDoc)
      // console.log(updateDoc)
      // res.send({result, updateRoom})
      res.send(result)
    })

    // Update Room Status
    app.patch('/room/status/:id', async (req, res) => {
      const id = req.params.id 
      const status = req.body.status

      // change room availability status
      const query = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {booked: status},
      }
      const result = await roomsCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    // get all booking for a guest
    app.get('/my-bookings/:email', verifyToken, async (req, res) =>{
      const email = req.params.email
      const query = {'guest.email': email}
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })
    // get all booking for a host
    app.get('/manage-bookings/:email', verifyToken, verifyHost, async (req, res) =>{
      const email = req.params.email
      const query = {'host.email': email}
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })

    // Update room data 
    app.put('/room/update/:id', verifyToken, verifyHost, async (req, res)=>{
      const id = req.params.id 
      const roomData = req.body 
      const query = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: roomData,
      }
      const result = await roomsCollection.updateOne(query, updateDoc)
      res.send(result)
    })

     // Delete a booking
     app.delete('/booking/:id', verifyToken, async (req, res) => {
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await bookingsCollection.deleteOne(query)
      res.send(result)
    })

    // Admin Statistics
    app.get('/admin-stat', verifyToken, verifyAdmin, async (req, res) =>{
      const bookingDetails = await bookingsCollection.find({},
        {
          projection:{
            date: 1,
            price:1,
          },
        }
      )
      .toArray()

      const totalUsers = await usersCollection.countDocuments()
      const totalRooms = await roomsCollection.countDocuments()
      const totalPrice =  bookingDetails.reduce(
        (sum, booking) => sum +booking.price,
        0 
      )

      const chatData = bookingDetails.map(booking => {
        const day = new Date(booking.date).getDate()
        const month = new Date(booking.date).getMonth() +1
        const data = [`${day}/${month}`, booking?.price]
        return data
      })
      chatData.unshift(['Day', 'Sales'])
      // chatData.splice(0,0,['Day', 'Sales'])
      console.log(chatData)
      console.log(bookingDetails)
      res.send({
        totalUsers,
        totalRooms,
        totalPrice,
        totalBookings: bookingDetails.length,
        chatData,
      })
    })
    // Host Statistics
    app.get('/host-stat', verifyToken, verifyHost, async (req, res) =>{
      const {email} = req.user 
      const bookingDetails = await bookingsCollection.find(
        {'host.email': email},
        {
          projection:{
            date: 1,
            price:1,
          },
        }
      )
      .toArray()

      
      const totalRooms = await roomsCollection.countDocuments({
        'host.email': email,
      })
      const totalPrice =  bookingDetails.reduce(
        (sum, booking) => sum +booking.price,
        0 
      )
      const {timestamp} = await usersCollection.findOne(
        {email},
        {projection: {timestamp: 1}}
      )

      const chatData = bookingDetails.map(booking => {
        const day = new Date(booking.date).getDate()
        const month = new Date(booking.date).getMonth() +1
        const data = [`${day}/${month}`, booking?.price]
        return data
      })
      chatData.unshift(['Day', 'Sales'])
      // chatData.splice(0,0,['Day', 'Sales'])
      console.log(chatData)
      console.log(bookingDetails)
      res.send({
        totalRooms,
        totalPrice,
        totalBookings: bookingDetails.length,
        chatData,
        hostSince: timestamp,
      })
    })
    // Guest Statistics
    app.get('/guest-stat', verifyToken, async (req, res) =>{
      const {email} = req.user 
      const bookingDetails = await bookingsCollection.find(
        {'guest.email': email},
        {
          projection:{
            date: 1,
            price:1,
          },
        }
      )
      .toArray()
      const totalPrice =  bookingDetails.reduce(
        (sum, booking) => sum +booking.price,
        0 
      )
      const {timestamp} = await usersCollection.findOne(
        {email},
        {projection: {timestamp: 1}}
      )

      const chatData = bookingDetails.map(booking => {
        const day = new Date(booking.date).getDate()
        const month = new Date(booking.date).getMonth() +1
        const data = [`${day}/${month}`, booking?.price]
        return data
      })
      chatData.unshift(['Day', 'Sales'])
      // chatData.splice(0,0,['Day', 'Sales'])
      console.log(chatData)
      console.log(bookingDetails)
      res.send({
        totalPrice,
        totalBookings: bookingDetails.length,
        chatData,
        guestSince: timestamp,
      })
    })
    
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from StayVista Server..')
})

app.listen(port, () => {
  console.log(`StayVista is running on port ${port}`)
})
