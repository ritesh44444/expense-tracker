# 💰 Expense Tracker

A full-stack expense management application built using FastAPI, PostgreSQL, SQLAlchemy, and JavaScript. It allows users to securely manage personal expenses, track spending, and filter transactions by category and date.

## ✨ Features

### 🔐 Authentication and Security
- User registration and login
- JWT-based authentication
- Secure password hashing using Argon2
- User-specific expense access

### 💸 Expense Management
- Add new expenses
- View all expenses
- Edit existing expenses
- Delete expenses
- Store expense details such as title, amount, category, date, and description

### 📊 Spending Insights
- View total spending
- View current month's spending
- Filter expenses by category
- Filter expenses by date range
- Automatically update spending summaries when expenses are added, edited, or deleted

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| PostgreSQL | Relational database |
| SQLAlchemy | Database ORM |
| Alembic | Database migrations |
| HTML | Frontend structure |
| CSS | Frontend styling |
| JavaScript | Frontend functionality and API integration |
| JWT | Authentication |
| Argon2 | Password hashing |
| Git and GitHub | Version control |

## 🏗️ Architecture

```text
             Frontend
       HTML + CSS + JavaScript
                 |
                 | HTTP Requests / JSON
                 |
                 v
              FastAPI
           Python Backend
                 |
                 | SQLAlchemy ORM
                 |
                 v
             PostgreSQL
              Database
```

The frontend communicates with the FastAPI backend through HTTP requests. The backend handles authentication, validation, and expense operations, while PostgreSQL stores user and expense information.

SQLAlchemy is used to interact with the database, and Alembic manages database schema migrations.

## 📁 Project Structure

```text
expense-tracker/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── security.py
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── script.js
│   └── style.css
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Before running the application, make sure you have installed:

- Python
- PostgreSQL
- Git
- Visual Studio Code
- Live Server extension for VS Code

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/ritesh44444/expense-tracker.git
cd expense-tracker
```

### 2. Create a virtual environment

On macOS or Linux:

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the root directory of the project.

Add the following variables:

```env
DATABASE_URL=postgresql+psycopg://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/expense_tracker
SECRET_KEY=YOUR_LONG_RANDOM_SECRET
```

Replace the placeholders with your PostgreSQL credentials and a securely generated secret key.

**Important:** Never commit your actual `.env` file or expose your secret key on GitHub.

The `.env.example` file provides a template without containing real credentials.

### 5. Create the PostgreSQL database

Start PostgreSQL and create a database named:

```text
expense_tracker
```

Ensure that your database username and credentials match the `DATABASE_URL` in your `.env` file.

### 6. Apply database migrations

From the project root, run:

```bash
alembic upgrade head
```

This applies the existing database migrations and brings the database schema up to the latest revision.

### 7. Start the backend

Run the following command from the project root:

```bash
uvicorn backend.main:app --reload
```

The backend will be available at:

http://127.0.0.1:8000

Interactive API documentation is available at:

http://127.0.0.1:8000/docs

### 8. Start the frontend

Open the `frontend` folder in Visual Studio Code.

Use the Live Server extension to launch `login.html` or `index.html`.

Ensure that the frontend's API URL in `script.js` matches the address where the backend is running. The backend's CORS configuration must also allow the frontend's origin.

## 🔌 API Endpoints

The application provides the following API endpoints:

| HTTP Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/register` | Register a new user | Not required |
| POST | `/login` | Authenticate a user and obtain a JWT | Not required |
| GET | `/expenses` | Retrieve the user's expenses | Required |
| GET | `/expenses/{expense_id}` | Retrieve a specific expense | Required |
| POST | `/expenses` | Create a new expense | Required |
| PUT | `/expenses/{expense_id}` | Update an existing expense | Required |
| DELETE | `/expenses/{expense_id}` | Delete an expense | Required |

Protected expense endpoints require a valid JWT access token.

You can explore and test these endpoints using the interactive Swagger UI at `/docs`.

## 🔐 Security

Security features implemented in the application include:

- Password hashing using Argon2
- JWT-based authentication
- Protected expense endpoints
- User-specific expense queries
- Environment variables for sensitive configuration
- Git exclusions for `.env` and the virtual environment

Each authenticated user can access only their own expenses through the protected API.

## 🧪 Testing

The following workflows have been manually tested:

- User registration and login
- Rejection of invalid login credentials
- Adding new expenses
- Editing existing expenses
- Deleting expenses
- Validation of expense inputs
- Automatic updating of spending summaries
- Category filtering
- Date-range filtering
- Isolation of expenses between different users

## 📚 Key Concepts Demonstrated

This project demonstrates practical experience with:

- REST API development
- Full CRUD operations
- Authentication and authorization
- JWT access tokens
- Password hashing
- Relational database design
- SQLAlchemy ORM
- Database migrations using Alembic
- Frontend-to-backend communication
- HTTP requests and JSON
- Environment variable management
- Git and GitHub version control

## 🔮 Future Improvements

Potential improvements include:

- Deploying the application online
- Adding spending charts and visualizations
- Implementing pagination and sorting
- Introducing monthly budgets
- Adding automated backend tests
- Improving mobile responsiveness

## 👨‍💻 Author

**Ritesh Shaw**

GitHub: [ritesh44444](https://github.com/ritesh44444)

Project Repository: [Expense Tracker](https://github.com/ritesh44444/expense-tracker)

---

Built to practice full-stack development, backend engineering, database integration, authentication, and frontend development.