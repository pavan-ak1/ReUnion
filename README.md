# 🧑‍🤝‍🧑 Reunion — Alumni Connect Platform

> **Reunion** is a full-stack web platform that bridges the gap between **students** and **alumni**,
> enabling mentorship, event participation, job opportunities, and networking within one ecosystem.

The system allows **students** to register, explore events, apply for jobs, and connect with mentors,
while **alumni** can create events, post jobs, and offer mentorship opportunities —
building a continuous and collaborative university community.

---

## 🏗️ Tech Stack

**Backend:**

* Node.js + Express (TypeScript)
* PostgreSQL (with connection pooling)
* JWT Authentication
* HTTP-only Secure Cookies
* Role-based Middleware Protection

**Frontend (Planned):**

* Next js + TypeScript

---

## 🗃️ Database Overview

### **users**

Stores all user accounts (both students and alumni).

```sql
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
```

### **students**

Student-specific academic details.

```sql
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    enrollment_year INT NOT NULL,
    degree VARCHAR(100),
    department VARCHAR(100),
    expected_graduation INT
```

### **alumni**

Alumni-specific professional details.

```sql
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    graduation_year INT NOT NULL,
    degree VARCHAR(100),
    department VARCHAR(100),
    current_position VARCHAR(100),
    company VARCHAR(100),
    location VARCHAR(100)
```

### **events**

Created by alumni and accessible to students.

```sql
    event_id SERIAL PRIMARY KEY,
    organizer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
```

### **jobs**

Job postings created by alumni.

```sql
    job_id SERIAL PRIMARY KEY,
    alumni_id INT REFERENCES alumni(user_id) ON DELETE CASCADE,
    job_title VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    job_description TEXT,
    location VARCHAR(100),
    employment_type VARCHAR(50),
    application_deadline DATE,
    posted_date TIMESTAMP DEFAULT NOW()
```

### **job_applications**

Applications submitted by students.

```sql
    application_id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (job_id, student_id)
```

### **mentors**

Mentorship profiles created by alumni.

```sql
    alumni_id INT PRIMARY KEY REFERENCES alumni(user_id) ON DELETE CASCADE,
    expertise TEXT NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    max_mentees INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW()
```

### **mentorship_requests**

Student requests to alumni mentors.

```sql
    request_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    mentor_id INT REFERENCES mentors(alumni_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, mentor_id)
```


## 🔐 Middleware

| Middleware       | Role                    | Description                                 |
| ---------------- | ----------------------- | ------------------------------------------- |
| `verifyStudent`  | Students only           | Restricts access to `role='student'` routes |
| `verifyAlumni`   | Alumni only             | Restricts access to `role='alumni'` routes  |

---

## 📡 API Documentation

### 🔑 **Authentication**

| Method | Route            | Description                       |
| ------ | ---------------- | --------------------------------- |
| `POST` | `/api/v1/signup` | Register new student or alumni    |
| `POST` | `/api/v1/signin` | Login for both student and alumni |

---

### 👨‍🎓 **Student Module**

| Method   | Route                                        | Description                   |
| -------- | -------------------------------------------- | ----------------------------- |
| `GET`    | `/api/v1/profile`                            | Get student profile           |
| `PUT`    | `/api/v1/profile/update`                     | Update student profile        |
| `GET`    | `/api/v1/events`                             | View all available events     |
| `POST`   | `/api/v1/student/events/register`            | Register for an event         |
| `DELETE` | `/api/v1/student/events/unregister/:eventId` | Cancel event registration     |
| `GET`    | `/api/v1/student/events`                     | View registered events        |
| `GET`    | `/api/v1/jobs`                               | View all jobs                 |
| `POST`   | `/api/v1/student/jobs/apply`                 | Apply for a job               |
| `GET`    | `/api/v1/student/jobs/applied`               | View applied jobs             |
| `GET`    | `/api/v1/student/mentorship/mentors`         | View available mentors        |
| `POST`   | `/api/v1/student/mentorship/request`         | Send mentorship request       |
| `GET`    | `/api/v1/student/mentorship/requests`        | View mentorship requests sent |
| `GET`    | `/api/v1/student/allAlumni`                   | View all Alumnis              |

---

### 👩‍💼 **Alumni Module**

| Method   | Route                                                           | Description                           |
| -------- | --------------------------------------------------------------- | ------------------------------------- |
| `GET`    | `/api/v1/alumni/profile`                                        | Get alumni profile                    |
| `PUT`    | `/api/v1/alumni/profile/update`                                 | Update alumni profile                 |
| `POST`   | `/api/v1/alumni/events/create`                                  | Create new event                      |
| `GET`    | `/api/v1/alumni/events`                                         | View all events created               |
| `PUT`    | `/api/v1/alumni/events/:eventId/update`                         | Update an event                       |
| `DELETE` | `/api/v1/alumni/events/:eventId/delete`                         | Delete an event                       |
| `POST`   | `/api/v1/alumni/jobs/create`                                    | Post a new job                        |
| `GET`    | `/api/v1/alumni/jobs`                                           | View posted jobs                      |
| `PUT`    | `/api/v1/alumni/jobs/:jobId/update`                             | Update job posting                    |
| `DELETE` | `/api/v1/alumni/jobs/:jobId/delete`                             | Delete job posting                    |
| `GET`    | `/api/v1/alumni/jobs/:jobId/applications`                       | View all applicants for a job         |
| `PUT`    | `/api/v1/alumni/jobs/:jobId/applications/:applicationId/status` | Update application status             |
| `POST`   | `/api/v1/alumni/mentorship/setup`                               | Create or update mentorship profile   |
| `GET`    | `/api/v1/alumni/mentorship/profile`                             | View mentorship profile               |
| `GET`    | `/api/v1/alumni/mentorship/requests`                            | View mentorship requests received     |
| `PUT`    | `/api/v1/alumni/mentorship/request/:requestId/status`           | Accept or reject a mentorship request |


---

### 🔔 **Notifications**

| Method | Route                                        | Description                |
| ------ | -------------------------------------------- | -------------------------- |
| `GET`  | `/api/v1/notifications`                      | Get all user notifications |
| `PUT`  | `/api/v1/notifications/:notificationId/read` | Mark notification as read  |

---

## ⚙️ Setup & Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/pavan-ak1/ReUnion.git
cd reunion

# 2️⃣ Install dependencies
npm install

# 3️⃣ Setup environment variables
touch .env
# Add these keys:
# DATABASE_URL=postgres://user:password@localhost:5432/reunion
# JWT_SECRET=your_secret_key
# COOKIE_SECRET=your_cookie_secret

# 4️⃣ Run database migrations (if using SQL schema files)
Run all sql files in models folder

# 5️⃣ Start the server (dev mode)
npm run dev
```

---

## 🧩 Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── student/
│   │   ├── alumni/
│   │   ├── mentorship/
│   │   └── notificationController.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   ├── routes/
│   │   ├── student*
│   │   ├── alumni*
│   │   └── notificationRoutes.ts
│   ├── db/
│   │   └── pool.ts
│   ├── utils/
│   │   ├── hashPassword.ts
│   │   ├── checkPasswordMatch.ts
│   │   └── generateToken.ts
│   └── app.ts
└── package.json
```

---


## 👨‍💻 Author

**Pavan A. Kustagi**
B.Tech CSE, UVCE
**Prateek Bhat**
B.Tech CSE, UVCE

---

