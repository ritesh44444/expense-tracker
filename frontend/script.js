const API_URL = "http://127.0.0.1:8000";

let token = localStorage.getItem("token");
let allExpenses = [];
let isLoading = false;


// =========================
// REGISTER
// =========================

async function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (!email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Registration failed.");
            return;
        }

        alert("Registration successful!");
        window.location.href = "login.html";

    } catch (error) {
        console.error(error);
        alert("Cannot connect to the server.");
    }
}


// =========================
// LOGIN
// =========================

async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Login failed.");
            return;
        }

        token = data.access_token;
        localStorage.setItem("token", token);

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert("Cannot connect to the server.");
    }
}


// =========================
// LOGOUT
// =========================

function logout() {
    localStorage.removeItem("token");
    token = null;

    window.location.replace("login.html");
}


// =========================
// API HELPER
// =========================

async function apiRequest(path, options = {}) {
    if (!token) {
        logout();
        throw new Error("Please log in again.");
    }

    const headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
    };

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        token = null;

        window.location.replace("login.html");

        throw new Error("Your session has expired.");
    }

    return response;
}


// =========================
// LOAD EXPENSES
// =========================

async function loadExpenses() {
    if (isLoading) {
        return;
    }

    isLoading = true;

    const container = document.getElementById("expenses");

    if (container) {
        container.textContent = "Loading expenses...";
    }

    try {
        const response = await apiRequest("/expenses");

        if (!response.ok) {
            throw new Error("Failed to load expenses.");
        }

        allExpenses = await response.json();

        updateCategoryOptions();
        updateSpendingSummary(allExpenses);
        applyFilters();

    } catch (error) {
        console.error(error);

        if (container && token) {
            container.textContent =
                "Unable to load expenses. Please try refreshing.";
        }

    } finally {
        isLoading = false;
    }
}


// =========================
// SPENDING SUMMARY
// =========================

function updateSpendingSummary(expenses) {
    const totalElement = document.getElementById("totalSpending");
    const monthlyElement = document.getElementById("monthlySpending");

    if (!totalElement || !monthlyElement) {
        return;
    }

    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyTotal = expenses.reduce((sum, expense) => {
        const [year, month] = expense.date.split("-").map(Number);

        if (year === currentYear && month === currentMonth) {
            return sum + Number(expense.amount);
        }

        return sum;
    }, 0);

    totalElement.textContent = formatCurrency(total);
    monthlyElement.textContent = formatCurrency(monthlyTotal);
}


function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}


// =========================
// DISPLAY EXPENSES
// =========================

function displayExpenses(expenses) {
    const container = document.getElementById("expenses");
    const countElement = document.getElementById("expenseCount");

    container.replaceChildren();

    if (countElement) {
        countElement.textContent =
            `${expenses.length} expense${expenses.length === 1 ? "" : "s"}`;
    }

    if (expenses.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent = allExpenses.length === 0
            ? "No expenses yet. Add your first expense above."
            : "No expenses match your filters.";

        container.appendChild(message);
        return;
    }

    expenses.forEach(expense => {
        const card = document.createElement("article");
        card.className = "expense-card";

        const top = document.createElement("div");
        top.className = "expense-card-top";

        const title = document.createElement("h3");
        title.textContent = expense.title;

        const amount = document.createElement("p");
        amount.className = "expense-amount";
        amount.textContent = formatCurrency(Number(expense.amount));

        top.append(title, amount);

        const category = document.createElement("span");
        category.className = "category-tag";
        category.textContent = expense.category;

        const date = document.createElement("p");
        date.className = "expense-date";
        date.textContent = `Date: ${expense.date}`;

        const description = document.createElement("p");
        description.className = "expense-description";
        description.textContent =
            expense.description || "No description";

        const actions = document.createElement("div");
        actions.className = "expense-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            editExpense(expense.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            deleteExpense(expense.id);
        });

        actions.append(editButton, deleteButton);

        card.append(top, category, date, description, actions);

        container.appendChild(card);
    });
}


// =========================
// READ FORM DATA
// =========================

function getExpenseFormData() {
    const title = document.getElementById("title").value.trim();
    const amountValue = document.getElementById("amount").value;
    const category = document.getElementById("category").value.trim();
    const date = document.getElementById("date").value;
    const description =
        document.getElementById("description").value.trim();

    if (!title || !amountValue || !category || !date) {
        alert("Please fill in the title, amount, category, and date.");
        return null;
    }

    const amount = Number(amountValue);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Amount must be greater than zero.");
        return null;
    }

    return {
        title,
        amount,
        category,
        date,
        description: description || null
    };
}


// =========================
// ADD OR UPDATE EXPENSE
// =========================

async function handleAddExpense(event) {
    if (event) {
        event.preventDefault();
    }

    const editId = document.getElementById("editId").value;
    const expense = getExpenseFormData();

    if (!expense) {
        return;
    }

    try {
        const isEditing = Boolean(editId);

        const response = await apiRequest(
            isEditing ? `/expenses/${editId}` : "/expenses",
            {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expense)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Unable to save expense.");
            return;
        }

        alert(isEditing
            ? "Expense updated successfully!"
            : "Expense added successfully!");

        clearExpenseForm();
        await loadExpenses();

    } catch (error) {
        console.error(error);
        alert(error.message || "Could not connect to the server.");
    }
}


// =========================
// EDIT EXPENSE
// =========================

async function editExpense(expenseId) {
    const expense = allExpenses.find(
        item => item.id === expenseId
    );

    if (!expense) {
        alert("Expense not found. Refresh and try again.");
        return;
    }

    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;
    document.getElementById("description").value =
        expense.description || "";

    document.getElementById("editId").value = expense.id;
    document.getElementById("formHeading").textContent = "Edit Expense";
    document.getElementById("addButton").textContent = "Update Expense";

    document.querySelector(".expense-form").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    document.getElementById("title").focus();
}


// =========================
// DELETE EXPENSE
// =========================

async function deleteExpense(expenseId) {
    const confirmed = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await apiRequest(
            `/expenses/${expenseId}`,
            { method: "DELETE" }
        );

        if (!response.ok) {
            const data = await response.json();
            alert(data.detail || "Failed to delete expense.");
            return;
        }

        await loadExpenses();

    } catch (error) {
        console.error(error);
        alert(error.message || "Could not connect to the server.");
    }
}


// =========================
// CLEAR FORM
// =========================

function clearExpenseForm() {
    document.getElementById("expenseForm").reset();
    document.getElementById("editId").value = "";
    document.getElementById("formHeading").textContent = "Add Expense";
    document.getElementById("addButton").textContent = "Add Expense";
}


// =========================
// CATEGORY FILTER OPTIONS
// =========================

function updateCategoryOptions() {
    const select = document.getElementById("categoryFilter");

    if (!select) {
        return;
    }

    const previousValue = select.value;

    const categories = [
        ...new Set(
            allExpenses
                .map(expense => expense.category.trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Categories";
    select.appendChild(allOption);

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });

    if (categories.includes(previousValue)) {
        select.value = previousValue;
    }
}


// =========================
// APPLY FILTERS
// =========================

function applyFilters() {
    const category = document.getElementById("categoryFilter").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (startDate && endDate && startDate > endDate) {
        alert("The start date cannot be after the end date.");
        return;
    }

    const filteredExpenses = allExpenses.filter(expense => {
        const matchesCategory =
            !category || expense.category.trim() === category;

        const matchesStartDate =
            !startDate || expense.date >= startDate;

        const matchesEndDate =
            !endDate || expense.date <= endDate;

        return (
            matchesCategory &&
            matchesStartDate &&
            matchesEndDate
        );
    });

    displayExpenses(filteredExpenses);
}


// =========================
// RESET FILTERS
// =========================

function resetFilters() {
    document.getElementById("categoryFilter").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";

    displayExpenses(allExpenses);
}


// =========================
// INITIALIZE DASHBOARD
// =========================

const expenseForm = document.getElementById("expenseForm");

if (expenseForm) {
    expenseForm.addEventListener("submit", handleAddExpense);
}

document.getElementById("clearButton")?.addEventListener(
    "click",
    clearExpenseForm
);

document.getElementById("refreshButton")?.addEventListener(
    "click",
    loadExpenses
);

document.getElementById("applyFiltersButton")?.addEventListener(
    "click",
    applyFilters
);

document.getElementById("resetFiltersButton")?.addEventListener(
    "click",
    resetFilters
);

if (
    window.location.pathname.endsWith("/index.html") &&
    token
) {
    loadExpenses();
}