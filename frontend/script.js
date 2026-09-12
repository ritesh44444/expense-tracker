const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");


function displayExpenses(expenses) {
    expenseList.innerHTML = "";

    if (expenses.length === 0) {
        expenseList.innerHTML = "<p>No expenses yet.</p>";
        return;
    }

    expenses.forEach(function (expense) {
        const expenseElement = document.createElement("div");

        expenseElement.innerHTML = `
            <h3>${expense.title}</h3>
            <p>Amount: ₹${expense.amount}</p>
            <p>Category: ${expense.category}</p>
            <p>Date: ${expense.date}</p>
            <p>Description: ${expense.description || "No description"}</p>

            <button onclick="editExpense(${expense.id})">
                Edit
            </button>

            <button onclick="deleteExpense(${expense.id})">
                Delete
            </button>
        `;

        expenseList.appendChild(expenseElement);
    });

    const total = expenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    const totalElement = document.createElement("h3");

    totalElement.textContent = `Total Expenses: ₹${total.toFixed(2)}`;

    expenseList.prepend(totalElement);
}


async function loadExpenses() {
    const response = await fetch("http://127.0.0.1:8000/expenses");

    const expenses = await response.json();

    displayExpenses(expenses);
}


async function deleteExpense(expenseId) {
    const confirmed = confirm("Are you sure you want to delete this expense?");

    if (!confirmed) {
        return;
    }

    const response = await fetch(
        `http://127.0.0.1:8000/expenses/${expenseId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        alert("Failed to delete expense.");
        return;
    }

    await response.json();

    loadExpenses();
}


async function editExpense(expenseId) {
    const response = await fetch(
        `http://127.0.0.1:8000/expenses/${expenseId}`
    );

    if (!response.ok) {
        alert("Expense not found.");
        return;
    }

    const expense = await response.json();

    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;
    document.getElementById("description").value =
        expense.description || "";

    form.dataset.editingId = expenseId;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;

    const expense = {
        title: title,
        amount: Number(amount),
        category: category,
        date: date,
        description: description
    };


    const editingId = form.dataset.editingId;


    if (editingId) {

        const response = await fetch(
            `http://127.0.0.1:8000/expenses/${editingId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expense)
            }
        );

        if (!response.ok) {
            alert("Failed to update expense.");
            return;
        }

        await response.json();

        delete form.dataset.editingId;

    } else {

        const response = await fetch(
            "http://127.0.0.1:8000/expenses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expense)
            }
        );

        if (!response.ok) {
            alert("Failed to create expense.");
            return;
        }

        await response.json();
    }


    form.reset();

    loadExpenses();
});


loadExpenses();