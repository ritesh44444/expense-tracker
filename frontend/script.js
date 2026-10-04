const API_URL = "http://127.0.0.1:8000";

let token = localStorage.getItem("token");


// =========================
// REGISTER
// =========================

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const response = await fetch(`${API_URL}/register`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail);
        return;
    }

    alert("Registration successful!");

    window.location.href = "login.html";
}


// =========================
// LOGIN
// =========================

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail);
        return;
    }

    token = data.access_token;

    localStorage.setItem("token", token);

    window.location.href = "index.html";
}


// =========================
// LOGOUT
// =========================

function logout() {
    localStorage.removeItem("token");

    token = null;

    window.location.href = "login.html";
}


// =========================
// LOAD EXPENSES
// =========================

async function loadExpenses() {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const response = await fetch(`${API_URL}/expenses`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        localStorage.removeItem("token");
        token = null;

        alert("Session expired. Please login again.");

        window.location.href = "login.html";

        return;
    }

    const expenses = await response.json();

    displayExpenses(expenses);
}


// =========================
// DISPLAY EXPENSES
// =========================

function displayExpenses(expenses) {

    const container = document.getElementById("expenses");

    container.innerHTML = "";

    if (expenses.length === 0) {
        container.innerHTML = "<p>No expenses yet.</p>";
        return;
    }

    expenses.forEach(expense => {

        const div = document.createElement("div");

        div.className = "expense-card";

        div.innerHTML = `
            <h3>${expense.title}</h3>

            <p><strong>Amount:</strong> ₹${expense.amount}</p>

            <p><strong>Category:</strong> ${expense.category}</p>

            <p><strong>Date:</strong> ${expense.date}</p>

            <p>
                <strong>Description:</strong>
                ${expense.description || "No description"}
            </p>

            <button onclick="editExpense(${expense.id})">
                Edit
            </button>

            <button onclick="deleteExpense(${expense.id})">
                Delete
            </button>
        `;

        container.appendChild(div);
    });
}


// =========================
// ADD EXPENSE
// =========================

async function handleAddExpense() {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const editId = document.getElementById("editId").value;

    // If an ID exists, we're editing
    if (editId) {
        await updateExpense();
        return;
    }

    // Otherwise, create a new expense
    const expense = {
        title: document.getElementById("title").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value,
        description: document.getElementById("description").value
    };

    const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify(expense)
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail);
        return;
    }

    alert("Expense added successfully!");

    clearExpenseForm();

    loadExpenses();
}


// =========================
// EDIT EXPENSE
// =========================

async function editExpense(expenseId) {

    const response = await fetch(
        `${API_URL}/expenses/${expenseId}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        alert("Could not find expense.");
        return;
    }

    const expense = await response.json();

    document.getElementById("title").value = expense.title;

    document.getElementById("amount").value = expense.amount;

    document.getElementById("category").value = expense.category;

    document.getElementById("date").value = expense.date;

    document.getElementById("description").value =
        expense.description || "";

    document.getElementById("editId").value = expense.id;

    document.getElementById("addButton").textContent =
        "Update Expense";
}


// =========================
// UPDATE EXPENSE
// =========================

async function updateExpense() {

    const expenseId = document.getElementById("editId").value;

    const expense = {
        title: document.getElementById("title").value,

        amount: Number(
            document.getElementById("amount").value
        ),

        category: document.getElementById("category").value,

        date: document.getElementById("date").value,

        description: document.getElementById("description").value
    };

    const response = await fetch(
        `${API_URL}/expenses/${expenseId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(expense)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail);
        return;
    }

    alert("Expense updated successfully!");

    clearExpenseForm();

    loadExpenses();
}


// =========================
// DELETE EXPENSE
// =========================

async function deleteExpense(expenseId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
        return;
    }

    const response = await fetch(
        `${API_URL}/expenses/${expenseId}`,
        {
            method: "DELETE",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail);
        return;
    }

    alert("Expense deleted successfully!");

    loadExpenses();
}


// =========================
// CLEAR FORM
// =========================

function clearExpenseForm() {

    document.getElementById("title").value = "";

    document.getElementById("amount").value = "";

    document.getElementById("category").value = "";

    document.getElementById("date").value = "";

    document.getElementById("description").value = "";

    document.getElementById("editId").value = "";

    document.getElementById("addButton").textContent =
        "Add Expense";
}

// Load expenses automatically when the dashboard opens
if (
    window.location.pathname.endsWith("index.html") &&
    token
) {
    loadExpenses();
}