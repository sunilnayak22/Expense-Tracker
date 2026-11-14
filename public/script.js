
const form = document.getElementById("expenseForm");

// Add new transaction
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    const message = document.getElementById("message");

    try {
        const response = await fetch("/add-expense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                amount,
                type
            })
        });

        const result = await response.json();

        message.textContent = result.message;

        if (!response.ok) {
            throw new Error(result.error || result.message);
        }

        form.reset();

        // Refresh transactions after saving
        await getData();

    } catch (error) {
        console.error("Add expense error:", error);
        message.textContent = error.message;
    }
});


// Fetch transactions from MongoDB
async function getData() {
    try {
        const response = await fetch("/api/data");

        const transactions = await response.json();

        if (!response.ok) {
            throw new Error(transactions.error || transactions.message);
        }

        displayTransactions(transactions);

        const totalIncome = transactions
            .filter(item => item.type === "income")
            .reduce((total, item) => total + item.amount, 0);

        const totalExpense = transactions
            .filter(item => item.type === "expense")
            .reduce((total, item) => total + item.amount, 0);

        const balance = totalIncome - totalExpense;

        document.getElementById("total-income").textContent =
            "₹ " + totalIncome;

        document.getElementById("total-expense").textContent =
            "₹ " + totalExpense;

        document.getElementById("total-balance").textContent =
            "₹ " + balance;

    } catch (error) {
        console.error("Fetch error:", error);

        document.getElementById("transaction-list").textContent =
            "Could not load transactions: " + error.message;
    }
}


// Display transactions
function displayTransactions(transactions, type = "all") {

    const container = document.getElementById("transaction-list");

    container.innerHTML = "";

    const filteredTransactions = transactions.filter(item => {
        return type === "all" || item.type === type;
    });

    if (filteredTransactions.length === 0) {
        container.textContent = "No transactions found.";
        return;
    }

    filteredTransactions.forEach(item => {

        const div = document.createElement("div");

        div.classList.add("transaction", item.type);

        const title = document.createElement("span");
        title.textContent = item.title;

        const amount = document.createElement("span");

        const sign = item.type === "income" ? "+" : "-";

        amount.textContent = sign + "₹ " + item.amount;

        div.append(title, amount);

        container.appendChild(div);
    });
}


// Navigation
const navLinks = document.querySelectorAll(".nav-link");

let allTransactions = [];

async function loadTransactions() {
    await getData();
}

// Initial load
loadTransactions();
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        const page = link.dataset.page;

        document.getElementById("page-title").textContent =
            page === "Dashboard" ? "All Transactions" : page;

        if (page === "Incomes") {
            displayTransactions(allTransactions, "income");
        } else if (page === "Expenses") {
            displayTransactions(allTransactions, "expense");
        } else {
            displayTransactions(allTransactions);
        }
    });
});