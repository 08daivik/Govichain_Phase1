---

# 📌 GOVICHAIN – Government Project Monitoring System

> A Full-Stack Role-Based Project Monitoring Platform built using **FastAPI, PostgreSQL, and React**.
> Designed to simulate transparent governance with multi-role workflows (Government, Contractor, Auditor).

---

## 🚀 Overview

**Govichain** is a secure, role-based government-style project tracking system that enables:

* Government officers to create and manage projects
* Contractors to submit milestone funding requests
* Auditors to approve or flag milestones
* Real-time dashboard analytics and progress tracking

The system enforces **JWT authentication**, **RBAC (Role-Based Access Control)**, and structured API-driven communication.

---

## 🏗️ Tech Stack

### 🔹 Backend

* **FastAPI**
* **PostgreSQL**
* **SQLAlchemy ORM**
* **JWT Authentication**
* **Pydantic**
* **Role-Based Access Control**

### 🔹 Frontend

* **React.js**
* **React Router**
* **Axios**
* **Component-based architecture**

---

## 👥 User Roles

| Role          | Capabilities                                   |
| ------------- | ---------------------------------------------- |
| 🏛 Government | Create projects, track progress, manage status |
| 🧱 Contractor | Submit milestone funding requests              |
| 🕵️ Auditor   | Approve or flag milestone submissions          |

---

## 📊 Key Features

* Secure JWT-based authentication
* Role-based route protection (backend enforced)
* Project & milestone lifecycle management
* Real-time progress calculation
* Budget utilization tracking
* Dashboard statistics
* Clean modular architecture

---

## 🗂️ Project Structure

```
govichain/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 📌 Prerequisites

Make sure the following are installed:

* **Python 3.10+**
* **PostgreSQL 16**
* **Node.js 18+**
* **Git**

---

## 🐘 Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE govichain;
```

---

## 🔹 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/govichain
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
### 🔑 Generating a Secure SECRET_KEY

The `SECRET_KEY` is used to sign and verify JWT tokens.  
For security reasons, generate your own unique secret key instead of using a hardcoded value.

#### Option 1: Generate Using Python (Recommended)

Run the following command in your terminal:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

This will generate a secure random 64-character hexadecimal key.

Example output:

4f8c9d2a7b6e1f3c8a5d9e0b2c4f6a8d1e3f5c7b9a2d4e6f8c1b3d5e7f9a0b2

Copy the generated value and replace your_secret_key in your .env file:
```bash
SECRET_KEY=your_generated_key_here
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger docs:

```
http://127.0.0.1:8000/docs
```

---

## 🔹 Frontend Setup

Open a new terminal:

```bash
cd frontend

npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

# 🔐 Authentication Flow

1. User logs in
2. Backend generates JWT token
3. Token stored in localStorage
4. Token sent in Authorization header
5. Backend validates and extracts role
6. Role-based access enforced server-side

---

# 📈 API Highlights

| Endpoint                   | Purpose                |
| -------------------------- | ---------------------- |
| `/auth/register`           | Register new user      |
| `/auth/login`              | Login & receive JWT    |
| `/projects/`               | Create / view projects |
| `/milestones/`             | Submit milestone       |
| `/milestones/{id}/approve` | Auditor approval       |
| `/projects/{id}/progress`  | Project analytics      |
| `/dashboard/my-stats`      | Role-based stats       |

---

# 🧪 Health Check

Backend provides health endpoint:

```
GET /health
```

Returns DB connectivity status.

---

# 🛡️ Security Features

* Password hashing using bcrypt
* JWT-based authentication
* Backend-enforced RBAC
* Environment variable secret management

---

# 🧠 Architecture Highlights

* Modular router structure
* Separation of concerns (Models / Schemas / Routes)
* Centralized API service layer (frontend)
* Context-based global auth state
* Clean component-driven UI

---

# 📌 Future Improvements

* Docker support
* Database migrations (Alembic)
* CI/CD integration
* Cloud deployment
* Audit logs

---

# 👨‍💻 Author

**Daivik S M**
Full Stack Developer | Computer Science Engineer

---
