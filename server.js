import express from "express";
import Mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1253908",
  key: "5c27a8a58ff960c179b6",
  secret: "2d9d605ff16337cd2e6b",
  cluster: "eu",
  useTLS: true,
});

app.use(express.json());
app.use(cors());

const connection_url =
  "mongodb+srv://AYAN__KHAN:pkll3YVI9De30vNG@cluster0.ujz7d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

Mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = Mongoose.connection;
db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("Messages");
  const ChangeStream = msgCollection.watch();

  ChangeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("error triggering Pusher");
    }
  });
});

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessages = req.body;
  Messages.create(dbMessages, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => {
  console.log("server is up and running");
});
