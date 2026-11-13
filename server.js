const dotenv = require("dotenv");

const result = dotenv.config({
    path: __dirname + "/.env"
});

console.log("DOTENV ERROR:", result.error);
console.log("LOADED VARIABLES:", Object.keys(result.parsed || {}));
console.log("MONGO URI LOADED:", !!process.env.MONGO_URI);


const express = require("express");
const mongoose = require("mongoose");

const Expense = require("./modules/expense");

const app = express();

app.use(express.json());
app.use(express.static("public"));
const path = require("path");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
// Connect MongoDB
async function connectDB(req, res, next) {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        next();
    } catch (error) {
        console.error("MongoDB error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
}

app.use(connectDB);


// POST API
app.post("/add-expense", async (req, res) => {

    try {

        const { title, amount, type } = req.body;

        const newExpense = new Expense({
            title,
            amount,
            type
        });

        await newExpense.save();

        res.status(201).json({
            message: "Expense added successfully",
            data: newExpense
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// Schema
const dataSchema = new mongoose.Schema(
    {
        id:new Object,
        title:String,
        amount:Number,
        type:String
    }
);

// Model - use your existing collection name
const Data = mongoose.model(
    "Data",
    dataSchema,
    "expenses"
);


app.get("/api/data", async (req, res) => {
    try {
        const data = await Data.find();

        res.json(data);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching data",
            error: error.message
        });
    }
});

module.exports = app;

// Only start a local server during local development
if (!process.env.VERCEL) {
    mongoose.connection.once("open", () => {
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server running on port 3000");
        });
    });
}