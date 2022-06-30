const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dbwlj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const tasksCollection = client.db("todo").collection("tasks");

    //get all tasks
    app.get("/tasks", async (req, res) => {
      const tasks = await tasksCollection.find({}).toArray();
      res.send(tasks);
    });

    // post a task
    app.post("/task", async (req, res) => {
      const task = req.body;
      await tasksCollection.insertOne(task);
      res.send(task);
    });

    //get task by id
    app.get("/task/:id", async (req, res) => {
        const id = req.params.id;
        const task = await tasksCollection.findOne({ _id: ObjectId(id) });
        res.send(task);
    });

    //update task by id
    app.put("/task/:id", async (req, res) => {
        const id = req.params.id;
        const task = req.body;
        await tasksCollection.updateOne({ _id: ObjectId(id) }, { $set: task });
        res.send(task);
    });

    //change status to completed by id
    app.put("/task/:id/complete", async (req, res) => {
        const id = req.params.id;
        const task = await tasksCollection.findOne({ _id: ObjectId(id) });
        await tasksCollection.updateOne({ _id: ObjectId(id) }, { $set: { completed: true } });
        res.send(task);
    });

    //get all completed tasks
    app.get("/tasks/completed", async (req, res) => {
        const tasks = await tasksCollection.find({ completed: true }).toArray();
        res.send(tasks);
    });

    console.log("Connected to MongoDB");
  } finally {
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task App");
});
app.listen(port, () => console.log(`Listening on port ${port}`));
