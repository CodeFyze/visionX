const mongoose = require("mongoose");
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

mongoose
  .connect(
    `mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@cluster0.39bho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then((res) => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to database => ", err);
  });
