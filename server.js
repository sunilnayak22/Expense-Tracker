require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");


const Expense = require("./modules/expense");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));


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

mongoose.connection.once("open", () => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server running at http://localhost:3000");
    });
});
