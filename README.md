# My Life - Simple Task Management 🚀

My Life is a clean, full-stack web application designed for simple task management (To-Do List). It focuses on providing a fast, distraction-free environment with secure, user-specific data management.

The application follows a modern, dark-themed UI and is built using Python's Flask framework for the backend API and pure HTML/CSS/JavaScript for the frontend.

## 🌟 Features

* **Secure Authentication:** User registration, login, and logout implemented using Flask-Login and secure password hashing (Werkzeug).
* **User-Specific Data:** Tasks are managed by a custom REST API that ensures users can only view and modify their own items.
* **Full CRUD API:** RESTful endpoints for Creating, Reading, Updating (status), and Deleting tasks.
* **Modern UI:** Dark-themed interface built with pure HTML/CSS and interactive frontend logic using JavaScript.
* **Database:** Persistent data storage managed by PostgreSQL (or SQLite for development) via Flask-SQLAlchemy and Flask-Migrate.

## 🛠️ Technology Stack

| Area | Technology |
| :--- | :--- |
| **Backend** | Python, Flask, Gunicorn |
| **Database** | PostgreSQL (Production), SQLite (Development) |
| **ORM/Migrations**| Flask-SQLAlchemy, Flask-Migrate |
| **Security** | Flask-Login, Werkzeug (Password Hashing) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (DOM Manipulation/Fetch API) |
| **Deployment** | Railway |

## ⚙️ Installation and Setup (Development)

Follow these steps to get a local copy of the project running:

### Prerequisites

* Python 3.8+
* pip (Python package installer)

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/eubrunoo/mytodo-personal-website](https://github.com/eubrunoo/mytodo-personal-website)
    cd my-life
    ```

2.  **Create and Activate Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # macOS/Linux
    .\venv\Scripts\activate   # Windows
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment:**
    * Create a file named **`.env`** in the project root.
    * Add your secret key (used by Flask-Login):
        ```
        SECRET_KEY="SUA_CHAVE_SECRETA_ALEATORIA_AQUI"
        ```

5.  **Initialize and Migrate Database (SQLite):**
    ```bash
    flask db upgrade
    ```
    *(This command will create the `tasks.db` file and the `users` and `tasks` tables.)*

6.  **Run the Application:**
    ```bash
    flask run
    ```
    The application will be accessible at `http://127.0.0.1:5000/`.

## 🚀 Deployment (Railway)

The project is configured for easy deployment on Platform as a Service (PaaS) providers like Railway or Render.

### Necessary Files:

* **`requirements.txt`**: Includes all Python dependencies, including `gunicorn` and `psycopg2-binary`.
* **`app.py`**: Configured to read the `DATABASE_URL` environment variable.

### Railway Start Command

To successfully run migrations before starting the web server, the **Start Command** in the Railway service settings must be set to:

```bash
flask db upgrade && gunicorn app:app