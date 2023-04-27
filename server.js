const express = require('express');
const server = express();
const path = require('path');
const authRoutes = require("./routes/authRoutes")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")

// middleware
server.use(express.static('public'));
server.use(express.json());
server.use(cookieParser())

// view engine
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, '/views'));

server.listen(80);
console.log('Connected!');

// page routes
server.use(authRoutes)

const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./the.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // The database URL depends on the location of the database
  databaseURL: "https://europe-west.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = getFirestore();

// db.collection("test").get().then(snapshot => {
//     snapshot.docs.forEach(doc => {
//         const data = doc.data()
//         console.log(data);
//     })
// })


async function update(snapshot) {

}

const createToken = (id, maxAge) => {
  return jwt.sign({ id }, 'n0!Ds[Lfs*2Bs!TsSd', {
      expiresIn: 12*60*60
  })
}

server.post('/login', (req, res) => {
  const {parcel} = req.body;
  console.log(parcel);
  
          if (!parcel) {
              return res.status(400).send({status:"failed"})
          }

          // jwtest = createToken(parcel)

          
          db.collection("adminCol").where("username", "==", parcel.username).get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                  // doc.data() is never undefined for query doc snapshots
                  const userDetails = doc.data()
                  let userLoggedIn = true

                  console.log(userDetails);

                  console.log("parcel pass: "+parcel.password);

                      if (parcel.password == userDetails.password) {
                      const jwt = createToken(userDetails.username);
                      // res.cookie("jwt", jwt, {httpOnly: true, maxAge: 12*60*60 * 1000})
                      res.cookie("jwt", jwt, {httpOnly: true})
                      res.status(200).send({
                          status: "recieved", userLoggedIn
                      })
                      }
                      else {
                      res.status(400).send({
                          status: "recieved", message: "Wrong user details. "
                      })
                      }

              });
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
              res.status(400).send({
                status: "recieved", message: "Error getting documents. "
            })
          });

          console.log(parcel);

})

server.post('/removeShoes', async (req, res) => {
  const {parcel} = req.body;
  console.log(parcel);
  console.log(`articlenumber is: ${parcel.articlenmbr}`);
  let articlenumber = Number(parcel.articlenmbr)
  console.log(articlenumber);
  console.log(typeof articlenumber);
  
          if (!parcel) {
              return res.status(400).send({status:"failed", message: "Invalid parcel"})
          }
          else {

          const shoesRef = db.collection('shoes')
          
          const snapshot = await shoesRef.where("articlenumber", "==", articlenumber).get()

          if (snapshot.empty) {
            console.log("invalid article number");
            res.status(400).send({
              status: "recieved", message: "A shoe with this article number does not exist"
          })
          }
          else {
            snapshot.forEach(doc => {
              // shoesRef.doc(doc.id).delete()
              console.log(`Doc ${doc.id} (${doc.data().name}) has been deleted!`);
              res.status(200).send({
                status: "recieved", message: `Doc ${doc.id} (${doc.data().name}) has been deleted!`
            })
            })
          }

        }

          console.log(parcel);

})

    server.get('/getLatest', (req, res) => {
      let testArray = []

              db.collection("shoes").orderBy("date", "desc").limit(10).get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                      // doc.data() is never undefined for query doc snapshots
                      const userDetails = doc.data()
                    testArray.push(userDetails)
                  });
              })
              .then(() => {
                res.status(200).send({
                  status: "recieved", releases: testArray
              })
              })
              .catch((error) => {
                  console.log("Error getting documents: ", error);
                  res.status(400).send({
                    status: "recieved", message: "Error getting documents. "
                })
              });
    
    })

    server.get('/getAll', (req, res) => {
      let testArray = []

              db.collection("shoes").orderBy("date", "desc").get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                      // doc.data() is never undefined for query doc snapshots
                      const userDetails = doc.data()
                    testArray.push(userDetails)
                  });
              })
              .then(() => {
                res.status(200).send({
                  status: "recieved", releases: testArray
              })
              })
              .catch((error) => {
                  console.log("Error getting documents: ", error);
                  res.status(400).send({
                    status: "recieved", message: "Error getting documents. "
                })
              });
    
    })

server.post('/addShoes', async (req, res) => {
    const {parcel} = req.body;

    let shoe = parcel.shoe
    let date = new Date()

    let item = {
      name: shoe.name,
      brand: shoe.brand,
      model: shoe.model,
      price: shoe.price,
      articlenumber: Number(shoe.article),
      date
  }

    let shoesRef = db.collection("shoes")

    const snapshot = await shoesRef.where("articlenumber", "==", item.articlenumber).get()

    if (snapshot.empty) {
      console.log(item);
      shoesRef.add(item)
      res.status(200).send({
        status: "recieved", message: `Adding shoe: ${item.name} `
    })
    }
    else {
      console.log("A shoe with that article number already exists!")
      res.status(400).send({
        status: "recieved", message: `A shoe with that article number already exists!`
    })
    }





})

server.post('/updateShoes', async (req, res) => {
  const {parcel} = req.body;

  let shoe = parcel.shoe
  let articlenumber = Number(parcel.articlenumber)

  console.log(shoe);
  console.log(articlenumber);
  console.log(typeof articlenumber);

  const shoesRef = db.collection('shoes')
          
  const snapshot = await shoesRef.where("articlenumber", "==", articlenumber).get()

  if (snapshot.empty) {
    console.log("invalid article number");
    res.status(400).send({
      status: "recieved", message: "A shoe with this article number does not exist"
  })
  }
  else {
    snapshot.forEach(doc => {
      // shoesRef.doc(doc.id).delete()
      
      for (const [key, value] of Object.entries(shoe)) {
        if (value != "") {
          db.collection("shoes").doc(doc.id).update({[key]: value})
        console.log(`${key}: ${value}, this works!!`);
      }
      }

      res.status(200).send({
        status: "recieved", message: `Doc ${doc.id} (${doc.data().name}) has been deleted!`
    })
    })
  }




})

// page not found
server.use((req, res) => res.status(404).render('404'));
