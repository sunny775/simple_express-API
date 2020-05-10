var mongoose = require("mongoose");
var Products = require("./Products");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
const multer = require("multer");
var fs = require("fs");
const path = require("path");
//
const backendHost = "http://localhost:5000";
const sampleMongodbUri =
  "mongodb+srv://kay:myRealPassword@cluster0.mongodb.net/test?w=majority";

mongoose.connect(
  sampleMongodbUri, // replace this with your real mongodb atlas uri
  { useNewUrlParser: true },
  function (err) {
    if (err) console.log(err, "database connection issue");
    console.log("Successfully connected");
  }
);

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
//==========================================================
app.post("/Products", upload.single("image"), (req, res, next) => {
  console.log(req.file);
  const product = new Products({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    featured: req.body.featured,
    image: req.file.filename,
    description: req.body.description,
    special: req.body.special,
    bestSeller: req.body.bestSeller,
  });
  product
    .save()
    .then(() => {
      res.status(201).json({
        product,
        message: "Product successfully uploaded to database",
      });
      console.log("Saved!!!!!");
    })
    .catch((err) => {
      res.status(500).send("Failed to upload. Try again");
      console.log(err);
    });
});
//================================================
app.get("/Products", (req, res, next) => {
  Products.find()
    .select("name price _id description image featured special bestSeller")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc.id,
            description: doc.description,
            image: `${backendHost}/uploads/${doc.image}`,
            featured: doc.featured,
            special: doc.special,
            bestSeller: doc.bestSeller,
          };
        }),
        //.filter(p => fs.existsSync(`uploads/${p.image}`))
      };
      res.status(200).json(response);
      console.log("accessed products");
    })
    .catch((err) => {
      res.status(500).send("Failed to fetch");
    });
});
//=================================================
app.get("/Products/:id", (req, res, next) => {
  const id = req.params.id;
  Products.findById(id)
    .select("name price _id description image")
    .exec()
    .then((doc) => {
      const response = {
        name: doc.name,
        price: doc.price,
        _id: doc.id,
        description: doc.description,
        image: `${backendHost}/uploads/${doc.image}`,
        featured: doc.featured,
        special: doc.special,
        bestSeller: doc.bestSeller,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).send("Failed to fetch");
    });
  console.log("accessed products");
});
//===========================================
app.delete("/Products/:id", (req, res, next) => {
  var id = req.params.id;
  Products.findByIdAndDelete(id)
    .then((doc) => {
      var url = doc.image;
      const path = `uploads/${url}`;
      if (fs.existsSync(path)) {
        fs.unlink(path, (err) => {
          if (err) {
            throw err;
          } else {
            res.status(200).send("Product successfully deleted");
          }
        });
      }
    })
    .catch((err) => {
      console.log("Error deleting from database");
    });
});

-app.get("/", function (req, res) {
  +app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
});

app.listen(process.env.PORT || 5000);
