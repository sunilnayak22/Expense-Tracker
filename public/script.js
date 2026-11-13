 const form = document.getElementById("expenseForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;

    const amount = Number(document.getElementById("amount").value);

    const type = document.getElementById("type").value;

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

        document.getElementById("message").textContent =
            result.message;

        if (response.ok) {
            form.reset();
        }

    } catch (error) {

        console.log(error);

    }

});

async function getData() {
      
        const response = await fetch("/api/data");

        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        // Convert response into JSON
        const transactions = await response.json();
        
        if (transactions.length === 0) {
            container.textContent = "No records found.";
            return;
        }

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



function displayTransactions(type = "all") {

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

        amount.textContent = sign + item.amount;

        div.append(title, amount);

        container.appendChild(div);

    });
}


displayTransactions();


const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        navLinks.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

        const page = link.dataset.page;

        document.getElementById("page-title").textContent =
            page === "Dashboard" ? "All Transactions" : page;

        if (page === "Incomes") {
            displayTransactions("income");
        }
        else if (page === "Expenses") {
            displayTransactions("expense");
        }
        else {
            displayTransactions("all");
        }

    });

});
}
getData()