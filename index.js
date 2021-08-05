import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { uid } from "uid";
import { join, dirname } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  await db.read();
  const { questions } = db.data;
  res.send({ status: 200, data: JSON.stringify(questions) });
});

app.post("/question", async (req, res) => {
  const { title, options } = req.body;
  await db.read();
  const { questions } = db.data;
  console.log(questions);
  questions.push({ options: options, title: title, id: uid() });
  await db.write(questions);
  await db.read();
  res.send({ status: 200, data: JSON.stringify(questions) });
});

app.delete("/question", async (req, res) => {
  const { id } = req.body;
  await db.read();
  let { questions } = db.data;

  const test = questions.filter((item) => {
    console.log(item.id, id);
    if (item.id !== id) {
      return item;
    }
  });
  console.log(test);
  questions = test;
  console.log("Q : ", questions);
  await db.write(questions);
  await db.read();
  res.send({ status: 200, data: JSON.stringify(questions) });
});

const PORT = 8080 || process.env.PORT;

app.listen(PORT, () => {
  console.log("Server started at port : ", PORT);
});
