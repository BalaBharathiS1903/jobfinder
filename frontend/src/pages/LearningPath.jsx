import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import "./LearningPath.css";

export const COURSES = {
  "python-basics": {
    title: "Python Basics", icon: "🐍", color: "#2563EB", light: "#EFF6FF",
    level: "Beginner", duration: "4 hrs",
    desc: "Variables, data types, loops, functions and OOP fundamentals.",
    skills: ["python", "oop", "functions", "loops", "data structures"],
    modules: [
      {
        title: "Introduction to Python",
        lessons: [
          { title: "What is Python?",              duration: "5 min", type: "reading" },
          { title: "Installing Python & VS Code",  duration: "8 min", type: "setup"   },
          { title: "Your first Python script",     duration: "6 min", type: "coding"  },
          { title: "Variables & data types",       duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "Control Flow",
        lessons: [
          { title: "if / elif / else",   duration: "7 min", type: "coding"  },
          { title: "for loops",          duration: "6 min", type: "coding"  },
          { title: "while loops",        duration: "5 min", type: "coding"  },
          { title: "break & continue",   duration: "5 min", type: "coding"  },
        ],
      },
      {
        title: "Functions & Scope",
        lessons: [
          { title: "Defining functions",          duration: "7 min", type: "coding"  },
          { title: "Arguments & return values",   duration: "6 min", type: "coding"  },
          { title: "Lambda functions",            duration: "5 min", type: "coding"  },
          { title: "Scope & closures",            duration: "8 min", type: "reading" },
        ],
      },
      {
        title: "Data Structures",
        lessons: [
          { title: "Lists & tuples",        duration: "8 min", type: "coding"  },
          { title: "Dictionaries",          duration: "7 min", type: "coding"  },
          { title: "Sets",                  duration: "5 min", type: "coding"  },
          { title: "List comprehensions",   duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "OOP Fundamentals",
        lessons: [
          { title: "Classes & objects",   duration: "8 min", type: "coding"  },
          { title: "__init__ method",     duration: "6 min", type: "coding"  },
          { title: "Inheritance",         duration: "7 min", type: "coding"  },
          { title: "Encapsulation",       duration: "6 min", type: "reading" },
        ],
      },
    ],
  },
  "web-dev": {
    title: "Web Development", icon: "🌐", color: "#7C3AED", light: "#F5F3FF",
    level: "Intermediate", duration: "6 hrs",
    desc: "HTML, CSS, JavaScript and React — build modern web apps from scratch.",
    skills: ["html", "css", "javascript", "react", "typescript", "tailwind", "bootstrap"],
    modules: [
      {
        title: "HTML Foundations",
        lessons: [
          { title: "Document structure",    duration: "6 min", type: "reading" },
          { title: "Semantic elements",     duration: "7 min", type: "coding"  },
          { title: "Forms & inputs",        duration: "8 min", type: "coding"  },
          { title: "Accessibility basics",  duration: "6 min", type: "reading" },
        ],
      },
      {
        title: "CSS Mastery",
        lessons: [
          { title: "Box model",          duration: "7 min", type: "coding"  },
          { title: "Flexbox",            duration: "9 min", type: "coding"  },
          { title: "CSS Grid",           duration: "9 min", type: "coding"  },
          { title: "Responsive design",  duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "JavaScript Core",
        lessons: [
          { title: "Variables & types",       duration: "7 min", type: "coding"  },
          { title: "DOM manipulation",        duration: "9 min", type: "coding"  },
          { title: "Events & listeners",      duration: "8 min", type: "coding"  },
          { title: "Fetch API & promises",    duration: "9 min", type: "coding"  },
        ],
      },
      {
        title: "React Essentials",
        lessons: [
          { title: "JSX & components",  duration: "8 min", type: "coding"  },
          { title: "Props & state",     duration: "9 min", type: "coding"  },
          { title: "useEffect hook",    duration: "8 min", type: "coding"  },
          { title: "React Router",      duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Project: Portfolio",
        lessons: [
          { title: "Planning the layout",     duration: "6 min", type: "reading" },
          { title: "Building components",     duration: "10 min", type: "coding" },
          { title: "Styling & animations",    duration: "9 min",  type: "coding" },
          { title: "Deploying to Vercel",     duration: "7 min",  type: "setup"  },
        ],
      },
    ],
  },
  "data-science": {
    title: "Data Science", icon: "📊", color: "#059669", light: "#ECFDF5",
    level: "Intermediate", duration: "5 hrs",
    desc: "NumPy, Pandas, data visualisation and intro to machine learning.",
    skills: ["python", "numpy", "pandas", "matplotlib", "scikit-learn", "tensorflow", "pytorch", "data science", "machine learning", "sql"],
    modules: [
      {
        title: "NumPy Essentials",
        lessons: [
          { title: "Arrays & operations",     duration: "8 min", type: "coding"  },
          { title: "Indexing & slicing",      duration: "7 min", type: "coding"  },
          { title: "Broadcasting",            duration: "6 min", type: "reading" },
          { title: "Linear algebra basics",   duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Pandas for Analysis",
        lessons: [
          { title: "DataFrames & Series",     duration: "9 min", type: "coding"  },
          { title: "Reading CSV/Excel",       duration: "6 min", type: "coding"  },
          { title: "Groupby & aggregation",   duration: "8 min", type: "coding"  },
          { title: "Handling missing data",   duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Data Visualisation",
        lessons: [
          { title: "Matplotlib basics",     duration: "8 min", type: "coding"  },
          { title: "Seaborn charts",        duration: "7 min", type: "coding"  },
          { title: "Plotly interactive",    duration: "8 min", type: "coding"  },
          { title: "Dashboard design",      duration: "6 min", type: "reading" },
        ],
      },
      {
        title: "Machine Learning Intro",
        lessons: [
          { title: "Supervised vs unsupervised",  duration: "7 min", type: "reading" },
          { title: "Linear regression",           duration: "9 min", type: "coding"  },
          { title: "Decision trees",              duration: "8 min", type: "coding"  },
          { title: "Model evaluation",            duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Capstone Project",
        lessons: [
          { title: "Dataset selection",     duration: "5 min", type: "reading" },
          { title: "EDA & cleaning",        duration: "10 min", type: "coding" },
          { title: "Model building",        duration: "10 min", type: "coding" },
          { title: "Presenting insights",   duration: "7 min",  type: "reading"},
        ],
      },
    ],
  },
  "django-rest": {
    title: "Django REST API", icon: "⚙️", color: "#D97706", light: "#FFFBEB",
    level: "Advanced", duration: "5 hrs",
    desc: "Build production-ready REST APIs with Django, DRF, JWT and PostgreSQL.",
    skills: ["django", "python", "rest api", "postgresql", "jwt", "docker", "nginx", "redis"],
    modules: [
      {
        title: "Django Foundations",
        lessons: [
          { title: "Project structure",     duration: "7 min", type: "reading" },
          { title: "Models & migrations",   duration: "9 min", type: "coding"  },
          { title: "Admin panel",           duration: "6 min", type: "coding"  },
          { title: "URL routing",           duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Django REST Framework",
        lessons: [
          { title: "Serializers",             duration: "9 min", type: "coding"  },
          { title: "APIView & ViewSets",      duration: "10 min", type: "coding" },
          { title: "Routers",                 duration: "6 min",  type: "coding" },
          { title: "Permissions & throttling",duration: "8 min",  type: "coding" },
        ],
      },
      {
        title: "Authentication",
        lessons: [
          { title: "Session vs token auth",   duration: "7 min", type: "reading" },
          { title: "JWT with SimpleJWT",      duration: "9 min", type: "coding"  },
          { title: "Refresh tokens",          duration: "7 min", type: "coding"  },
          { title: "Custom user model",       duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "Advanced Patterns",
        lessons: [
          { title: "Filtering & search",  duration: "8 min", type: "coding"  },
          { title: "Pagination",          duration: "6 min", type: "coding"  },
          { title: "File uploads",        duration: "7 min", type: "coding"  },
          { title: "Signal handlers",     duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Deployment",
        lessons: [
          { title: "PostgreSQL setup",        duration: "8 min", type: "setup"   },
          { title: "Environment variables",   duration: "5 min", type: "setup"   },
          { title: "Gunicorn & Nginx",        duration: "8 min", type: "setup"   },
          { title: "Deploy to Railway",       duration: "9 min", type: "setup"   },
        ],
      },
    ],
  },

  "javascript-advanced": {
    title: "JavaScript Advanced", icon: "📰", color: "#CA8A04", light: "#FEFCE8",
    level: "Intermediate", duration: "5 hrs",
    desc: "ES6+, async/await, closures, prototypes and modern JS patterns.",
    skills: ["javascript", "typescript", "node.js", "express", "rest api"],
    modules: [
      {
        title: "ES6+ Fundamentals",
        lessons: [
          { title: "let, const & block scope",     duration: "6 min", type: "coding"  },
          { title: "Arrow functions",              duration: "5 min", type: "coding"  },
          { title: "Destructuring & spread",       duration: "7 min", type: "coding"  },
          { title: "Template literals & modules",  duration: "6 min", type: "coding"  },
        ],
      },
      {
        title: "Async JavaScript",
        lessons: [
          { title: "Callbacks & the event loop",  duration: "8 min", type: "reading" },
          { title: "Promises",                    duration: "8 min", type: "coding"  },
          { title: "async / await",               duration: "7 min", type: "coding"  },
          { title: "Fetch API & error handling",  duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "Core Concepts",
        lessons: [
          { title: "Closures",          duration: "8 min", type: "reading" },
          { title: "Prototypes & this", duration: "9 min", type: "coding"  },
          { title: "Classes & OOP",     duration: "7 min", type: "coding"  },
          { title: "Iterators & generators", duration: "7 min", type: "coding" },
        ],
      },
      {
        title: "DOM & Browser APIs",
        lessons: [
          { title: "DOM traversal & manipulation", duration: "8 min", type: "coding"  },
          { title: "Event delegation",             duration: "6 min", type: "coding"  },
          { title: "LocalStorage & SessionStorage",duration: "5 min", type: "coding"  },
          { title: "Web APIs overview",            duration: "6 min", type: "reading" },
        ],
      },
      {
        title: "Node.js & Express Basics",
        lessons: [
          { title: "Node.js runtime",       duration: "6 min", type: "reading" },
          { title: "npm & package.json",    duration: "5 min", type: "setup"   },
          { title: "Express server setup",  duration: "8 min", type: "coding"  },
          { title: "REST API with Express", duration: "9 min", type: "coding"  },
        ],
      },
    ],
  },

  "sql-databases": {
    title: "SQL & Databases", icon: "🗄️", color: "#0891B2", light: "#ECFEFF",
    level: "Beginner", duration: "4 hrs",
    desc: "SQL queries, joins, indexes, transactions and database design.",
    skills: ["sql", "mysql", "postgresql", "sqlite", "mongodb"],
    modules: [
      {
        title: "SQL Basics",
        lessons: [
          { title: "What is a relational database?", duration: "6 min", type: "reading" },
          { title: "SELECT, WHERE, ORDER BY",        duration: "8 min", type: "coding"  },
          { title: "INSERT, UPDATE, DELETE",         duration: "7 min", type: "coding"  },
          { title: "Filtering with AND, OR, IN",     duration: "6 min", type: "coding"  },
        ],
      },
      {
        title: "Joins & Relationships",
        lessons: [
          { title: "Primary & foreign keys",  duration: "7 min", type: "reading" },
          { title: "INNER JOIN",              duration: "8 min", type: "coding"  },
          { title: "LEFT & RIGHT JOIN",       duration: "7 min", type: "coding"  },
          { title: "Self joins & aliases",    duration: "6 min", type: "coding"  },
        ],
      },
      {
        title: "Aggregation & Grouping",
        lessons: [
          { title: "COUNT, SUM, AVG, MIN, MAX", duration: "7 min", type: "coding"  },
          { title: "GROUP BY & HAVING",         duration: "7 min", type: "coding"  },
          { title: "Subqueries",                duration: "8 min", type: "coding"  },
          { title: "Window functions",          duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "Database Design",
        lessons: [
          { title: "Normalisation (1NF, 2NF, 3NF)", duration: "8 min", type: "reading" },
          { title: "Indexes & performance",          duration: "7 min", type: "coding"  },
          { title: "Transactions & ACID",            duration: "7 min", type: "reading" },
          { title: "Views & stored procedures",      duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "PostgreSQL & MySQL",
        lessons: [
          { title: "PostgreSQL setup & psql CLI",  duration: "7 min", type: "setup"   },
          { title: "Data types in PostgreSQL",     duration: "6 min", type: "reading" },
          { title: "MySQL vs PostgreSQL",          duration: "5 min", type: "reading" },
          { title: "Connecting to Django / Node",  duration: "8 min", type: "coding"  },
        ],
      },
    ],
  },

  "git-devops": {
    title: "Git & DevOps", icon: "🔧", color: "#DC2626", light: "#FEF2F2",
    level: "Beginner", duration: "4 hrs",
    desc: "Git version control, GitHub workflows, Docker, CI/CD and cloud basics.",
    skills: ["git", "github", "gitlab", "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "jenkins", "linux"],
    modules: [
      {
        title: "Git Fundamentals",
        lessons: [
          { title: "What is version control?",    duration: "5 min", type: "reading" },
          { title: "init, add, commit, status",   duration: "8 min", type: "coding"  },
          { title: "Branching & merging",         duration: "8 min", type: "coding"  },
          { title: "Resolving merge conflicts",   duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "GitHub & Collaboration",
        lessons: [
          { title: "Remote repos & push/pull",  duration: "7 min", type: "coding"  },
          { title: "Pull requests & code review",duration: "7 min", type: "reading" },
          { title: "GitHub Actions basics",      duration: "8 min", type: "coding"  },
          { title: "Git workflows (GitFlow)",    duration: "6 min", type: "reading" },
        ],
      },
      {
        title: "Docker",
        lessons: [
          { title: "What is Docker?",          duration: "6 min", type: "reading" },
          { title: "Dockerfile & images",      duration: "9 min", type: "coding"  },
          { title: "Containers & volumes",     duration: "8 min", type: "coding"  },
          { title: "Docker Compose",           duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "CI/CD Pipelines",
        lessons: [
          { title: "What is CI/CD?",              duration: "6 min", type: "reading" },
          { title: "GitHub Actions workflow",     duration: "9 min", type: "coding"  },
          { title: "Automated testing in CI",     duration: "7 min", type: "coding"  },
          { title: "Deploy on merge to main",     duration: "7 min", type: "setup"   },
        ],
      },
      {
        title: "Cloud & Linux Basics",
        lessons: [
          { title: "Linux command line essentials", duration: "8 min", type: "coding"  },
          { title: "AWS core services overview",    duration: "7 min", type: "reading" },
          { title: "EC2, S3 & IAM basics",          duration: "8 min", type: "reading" },
          { title: "Deploying a Docker app to AWS", duration: "9 min", type: "setup"   },
        ],
      },
    ],
  },

  "java-basics": {
    title: "Java Fundamentals", icon: "☕", color: "#B45309", light: "#FEF3C7",
    level: "Beginner", duration: "5 hrs",
    desc: "Core Java — syntax, OOP, collections, exceptions and intro to Spring.",
    skills: ["java", "kotlin", "spring boot", "maven", "gradle"],
    modules: [
      { title: "Java Basics", lessons: [
        { title: "JDK setup & Hello World",   duration: "7 min", type: "setup"   },
        { title: "Variables & data types",    duration: "7 min", type: "coding"  },
        { title: "Operators & expressions",   duration: "6 min", type: "coding"  },
        { title: "Control flow",              duration: "7 min", type: "coding"  },
      ]},
      { title: "Object-Oriented Programming", lessons: [
        { title: "Classes & objects",              duration: "8 min", type: "coding"  },
        { title: "Constructors & this",            duration: "6 min", type: "coding"  },
        { title: "Inheritance & super",            duration: "8 min", type: "coding"  },
        { title: "Interfaces & abstract classes",  duration: "8 min", type: "coding"  },
      ]},
      { title: "Collections & Generics", lessons: [
        { title: "Arrays & ArrayList",   duration: "7 min", type: "coding"  },
        { title: "HashMap & HashSet",    duration: "7 min", type: "coding"  },
        { title: "Iterators & for-each", duration: "6 min", type: "coding"  },
        { title: "Generics basics",      duration: "7 min", type: "reading" },
      ]},
      { title: "Exception Handling & I/O", lessons: [
        { title: "try / catch / finally", duration: "7 min", type: "coding"  },
        { title: "Custom exceptions",     duration: "6 min", type: "coding"  },
        { title: "File I/O basics",       duration: "7 min", type: "coding"  },
        { title: "Java streams intro",    duration: "7 min", type: "coding"  },
      ]},
      { title: "Spring Boot Intro", lessons: [
        { title: "What is Spring Boot?",      duration: "6 min", type: "reading" },
        { title: "Creating a Spring project", duration: "8 min", type: "setup"   },
        { title: "REST controller basics",    duration: "9 min", type: "coding"  },
        { title: "Connecting to a database",  duration: "8 min", type: "coding"  },
      ]},
    ],
  },

  "typescript": {
    title: "TypeScript", icon: "📘", color: "#2563EB", light: "#EFF6FF",
    level: "Intermediate", duration: "4 hrs",
    desc: "Static typing for JavaScript — types, interfaces, generics and tooling.",
    skills: ["typescript", "javascript", "react", "node.js"],
    modules: [
      { title: "TypeScript Basics", lessons: [
        { title: "Why TypeScript?",           duration: "5 min", type: "reading" },
        { title: "Types & type annotations",  duration: "7 min", type: "coding"  },
        { title: "Union & intersection types",duration: "7 min", type: "coding"  },
        { title: "Type inference",            duration: "6 min", type: "coding"  },
      ]},
      { title: "Interfaces & Types", lessons: [
        { title: "Interfaces vs type aliases", duration: "7 min", type: "coding"  },
        { title: "Optional & readonly props",  duration: "6 min", type: "coding"  },
        { title: "Extending interfaces",       duration: "6 min", type: "coding"  },
        { title: "Enums",                      duration: "5 min", type: "coding"  },
      ]},
      { title: "Functions & Classes", lessons: [
        { title: "Typed functions",         duration: "6 min", type: "coding"  },
        { title: "Classes with TypeScript", duration: "8 min", type: "coding"  },
        { title: "Access modifiers",        duration: "6 min", type: "coding"  },
        { title: "Abstract classes",        duration: "6 min", type: "coding"  },
      ]},
      { title: "Generics", lessons: [
        { title: "Generic functions",     duration: "7 min", type: "coding"  },
        { title: "Generic interfaces",    duration: "6 min", type: "coding"  },
        { title: "Constraints",           duration: "6 min", type: "coding"  },
        { title: "Utility types",         duration: "7 min", type: "coding"  },
      ]},
      { title: "TypeScript in Practice", lessons: [
        { title: "tsconfig.json setup",       duration: "6 min", type: "setup"   },
        { title: "TypeScript with React",     duration: "8 min", type: "coding"  },
        { title: "TypeScript with Node.js",   duration: "7 min", type: "coding"  },
        { title: "Declaration files (.d.ts)", duration: "6 min", type: "reading" },
      ]},
    ],
  },

  "golang": {
    title: "Go (Golang)", icon: "🐹", color: "#00ADD8", light: "#E0F7FA",
    level: "Intermediate", duration: "5 hrs",
    desc: "Concurrency, fast compilation and simplicity — Go for backend and CLI tools.",
    skills: ["go", "docker", "kubernetes", "rest api"],
    modules: [
      { title: "Go Basics", lessons: [
        { title: "Go setup & workspace",   duration: "6 min", type: "setup"   },
        { title: "Variables & types",      duration: "7 min", type: "coding"  },
        { title: "Functions & packages",   duration: "7 min", type: "coding"  },
        { title: "Control flow",           duration: "6 min", type: "coding"  },
      ]},
      { title: "Data Structures", lessons: [
        { title: "Arrays & slices",  duration: "7 min", type: "coding"  },
        { title: "Maps",             duration: "6 min", type: "coding"  },
        { title: "Structs",          duration: "7 min", type: "coding"  },
        { title: "Pointers",         duration: "7 min", type: "coding"  },
      ]},
      { title: "Interfaces & Methods", lessons: [
        { title: "Methods on structs",  duration: "7 min", type: "coding"  },
        { title: "Interfaces",          duration: "8 min", type: "coding"  },
        { title: "Error handling",      duration: "7 min", type: "coding"  },
        { title: "Defer & panic",       duration: "6 min", type: "coding"  },
      ]},
      { title: "Concurrency", lessons: [
        { title: "Goroutines",       duration: "8 min", type: "coding"  },
        { title: "Channels",         duration: "8 min", type: "coding"  },
        { title: "Select statement", duration: "6 min", type: "coding"  },
        { title: "sync package",     duration: "6 min", type: "coding"  },
      ]},
      { title: "Building APIs with Go", lessons: [
        { title: "net/http basics",       duration: "7 min", type: "coding"  },
        { title: "Routing with Gin",      duration: "8 min", type: "coding"  },
        { title: "JSON encoding",         duration: "6 min", type: "coding"  },
        { title: "Connecting to Postgres",duration: "8 min", type: "coding"  },
      ]},
    ],
  },

  "rust-lang": {
    title: "Rust", icon: "⚙️", color: "#B7410E", light: "#FFF1EE",
    level: "Advanced", duration: "6 hrs",
    desc: "Memory safety without GC — ownership, borrowing, lifetimes and systems programming.",
    skills: ["rust", "assembly", "c", "c++"],
    modules: [
      { title: "Rust Basics", lessons: [
        { title: "Installing Rust & Cargo",  duration: "6 min", type: "setup"   },
        { title: "Variables & mutability",   duration: "7 min", type: "coding"  },
        { title: "Data types",               duration: "6 min", type: "coding"  },
        { title: "Functions & control flow", duration: "7 min", type: "coding"  },
      ]},
      { title: "Ownership & Borrowing", lessons: [
        { title: "Ownership rules",    duration: "9 min", type: "reading" },
        { title: "References & borrowing", duration: "8 min", type: "coding" },
        { title: "Slices",             duration: "6 min", type: "coding"  },
        { title: "Lifetimes intro",    duration: "8 min", type: "reading" },
      ]},
      { title: "Structs & Enums", lessons: [
        { title: "Structs",           duration: "7 min", type: "coding"  },
        { title: "Enums & match",     duration: "8 min", type: "coding"  },
        { title: "Option & Result",   duration: "8 min", type: "coding"  },
        { title: "Pattern matching",  duration: "7 min", type: "coding"  },
      ]},
      { title: "Traits & Generics", lessons: [
        { title: "Traits",            duration: "8 min", type: "coding"  },
        { title: "Generic functions", duration: "7 min", type: "coding"  },
        { title: "Trait bounds",      duration: "6 min", type: "coding"  },
        { title: "Closures",          duration: "7 min", type: "coding"  },
      ]},
      { title: "Concurrency & Cargo", lessons: [
        { title: "Threads in Rust",      duration: "8 min", type: "coding"  },
        { title: "Message passing",      duration: "7 min", type: "coding"  },
        { title: "Cargo & crates.io",    duration: "6 min", type: "setup"   },
        { title: "Error handling patterns", duration: "7 min", type: "coding" },
      ]},
    ],
  },

  "kotlin": {
    title: "Kotlin", icon: "🟣", color: "#7F52FF", light: "#F3EEFF",
    level: "Intermediate", duration: "4 hrs",
    desc: "Modern JVM language — null safety, coroutines and Android development.",
    skills: ["kotlin", "java", "android", "spring boot"],
    modules: [
      { title: "Kotlin Basics", lessons: [
        { title: "Kotlin vs Java",          duration: "5 min", type: "reading" },
        { title: "Variables & null safety", duration: "7 min", type: "coding"  },
        { title: "Functions & lambdas",     duration: "7 min", type: "coding"  },
        { title: "Control flow",            duration: "6 min", type: "coding"  },
      ]},
      { title: "OOP in Kotlin", lessons: [
        { title: "Classes & data classes",  duration: "7 min", type: "coding"  },
        { title: "Inheritance & interfaces",duration: "7 min", type: "coding"  },
        { title: "Object & companion",      duration: "6 min", type: "coding"  },
        { title: "Sealed classes",          duration: "6 min", type: "coding"  },
      ]},
      { title: "Collections & Extensions", lessons: [
        { title: "Lists, maps & sets",    duration: "7 min", type: "coding"  },
        { title: "Extension functions",   duration: "7 min", type: "coding"  },
        { title: "Higher-order functions",duration: "7 min", type: "coding"  },
        { title: "Scope functions",       duration: "6 min", type: "coding"  },
      ]},
      { title: "Coroutines", lessons: [
        { title: "What are coroutines?",  duration: "7 min", type: "reading" },
        { title: "launch & async",        duration: "8 min", type: "coding"  },
        { title: "suspend functions",     duration: "7 min", type: "coding"  },
        { title: "Flow basics",           duration: "7 min", type: "coding"  },
      ]},
      { title: "Android with Kotlin", lessons: [
        { title: "Android Studio setup",    duration: "7 min", type: "setup"   },
        { title: "Activities & layouts",    duration: "8 min", type: "coding"  },
        { title: "ViewModel & LiveData",    duration: "8 min", type: "coding"  },
        { title: "Jetpack Compose basics",  duration: "8 min", type: "coding"  },
      ]},
    ],
  },

  "cpp": {
    title: "C / C++", icon: "🔧", color: "#00599C", light: "#E8F4FD",
    level: "Intermediate", duration: "5 hrs",
    desc: "Systems programming — memory management, pointers, OOP and STL.",
    skills: ["c", "c++", "assembly", "rust"],
    modules: [
      { title: "C Fundamentals", lessons: [
        { title: "C setup & Hello World",  duration: "6 min", type: "setup"   },
        { title: "Variables & data types", duration: "7 min", type: "coding"  },
        { title: "Pointers & memory",      duration: "9 min", type: "coding"  },
        { title: "Arrays & strings",       duration: "7 min", type: "coding"  },
      ]},
      { title: "Functions & Structs", lessons: [
        { title: "Functions & recursion",  duration: "7 min", type: "coding"  },
        { title: "Structs & unions",       duration: "7 min", type: "coding"  },
        { title: "File I/O in C",          duration: "7 min", type: "coding"  },
        { title: "Dynamic memory (malloc)",duration: "8 min", type: "coding"  },
      ]},
      { title: "C++ OOP", lessons: [
        { title: "Classes & objects",      duration: "8 min", type: "coding"  },
        { title: "Constructors & destructors", duration: "7 min", type: "coding" },
        { title: "Inheritance",            duration: "7 min", type: "coding"  },
        { title: "Polymorphism & virtual", duration: "8 min", type: "coding"  },
      ]},
      { title: "STL & Templates", lessons: [
        { title: "Vectors & lists",    duration: "7 min", type: "coding"  },
        { title: "Maps & sets",        duration: "7 min", type: "coding"  },
        { title: "Iterators",          duration: "6 min", type: "coding"  },
        { title: "Templates",          duration: "7 min", type: "coding"  },
      ]},
      { title: "Modern C++", lessons: [
        { title: "Smart pointers",     duration: "8 min", type: "coding"  },
        { title: "Lambda expressions", duration: "7 min", type: "coding"  },
        { title: "Move semantics",     duration: "7 min", type: "reading" },
        { title: "Concurrency basics", duration: "7 min", type: "coding"  },
      ]},
    ],
  },

  "php": {
    title: "PHP & Laravel", icon: "🐘", color: "#777BB4", light: "#F0F0FF",
    level: "Beginner", duration: "4 hrs",
    desc: "Server-side scripting with PHP and the Laravel MVC framework.",
    skills: ["php", "laravel", "mysql", "html", "css"],
    modules: [
      { title: "PHP Basics", lessons: [
        { title: "PHP setup & syntax",     duration: "6 min", type: "setup"   },
        { title: "Variables & data types", duration: "6 min", type: "coding"  },
        { title: "Arrays & functions",     duration: "7 min", type: "coding"  },
        { title: "Forms & superglobals",   duration: "7 min", type: "coding"  },
      ]},
      { title: "OOP in PHP", lessons: [
        { title: "Classes & objects",   duration: "7 min", type: "coding"  },
        { title: "Inheritance",         duration: "6 min", type: "coding"  },
        { title: "Interfaces & traits", duration: "7 min", type: "coding"  },
        { title: "Namespaces",          duration: "5 min", type: "coding"  },
      ]},
      { title: "PHP & MySQL", lessons: [
        { title: "PDO & prepared statements", duration: "8 min", type: "coding"  },
        { title: "CRUD operations",           duration: "8 min", type: "coding"  },
        { title: "Sessions & cookies",        duration: "6 min", type: "coding"  },
        { title: "File uploads",              duration: "6 min", type: "coding"  },
      ]},
      { title: "Laravel Basics", lessons: [
        { title: "Laravel setup & Artisan",  duration: "7 min", type: "setup"   },
        { title: "Routes & controllers",     duration: "8 min", type: "coding"  },
        { title: "Blade templates",          duration: "7 min", type: "coding"  },
        { title: "Eloquent ORM",             duration: "8 min", type: "coding"  },
      ]},
      { title: "Laravel Advanced", lessons: [
        { title: "Migrations & seeders",  duration: "7 min", type: "coding"  },
        { title: "Authentication",        duration: "7 min", type: "coding"  },
        { title: "REST API with Laravel", duration: "8 min", type: "coding"  },
        { title: "Queues & jobs",         duration: "7 min", type: "coding"  },
      ]},
    ],
  },

  "ruby": {
    title: "Ruby & Rails", icon: "💎", color: "#CC342D", light: "#FFF0EF",
    level: "Intermediate", duration: "4 hrs",
    desc: "Elegant scripting with Ruby and rapid web development with Rails.",
    skills: ["ruby", "rails", "postgresql", "html"],
    modules: [
      { title: "Ruby Basics", lessons: [
        { title: "Ruby setup & IRB",       duration: "5 min", type: "setup"   },
        { title: "Variables & types",      duration: "6 min", type: "coding"  },
        { title: "Strings & symbols",      duration: "6 min", type: "coding"  },
        { title: "Arrays & hashes",        duration: "7 min", type: "coding"  },
      ]},
      { title: "OOP in Ruby", lessons: [
        { title: "Classes & methods",   duration: "7 min", type: "coding"  },
        { title: "Inheritance & mixins",duration: "7 min", type: "coding"  },
        { title: "Modules",             duration: "6 min", type: "coding"  },
        { title: "Blocks & procs",      duration: "7 min", type: "coding"  },
      ]},
      { title: "Ruby Idioms", lessons: [
        { title: "Iterators & enumerables", duration: "7 min", type: "coding"  },
        { title: "Exception handling",      duration: "6 min", type: "coding"  },
        { title: "File I/O",               duration: "5 min", type: "coding"  },
        { title: "Gems & Bundler",         duration: "5 min", type: "setup"   },
      ]},
      { title: "Rails Basics", lessons: [
        { title: "MVC architecture",       duration: "6 min", type: "reading" },
        { title: "Rails setup & scaffold", duration: "8 min", type: "setup"   },
        { title: "Routes & controllers",   duration: "8 min", type: "coding"  },
        { title: "Active Record",          duration: "8 min", type: "coding"  },
      ]},
      { title: "Rails in Production", lessons: [
        { title: "Migrations & validations", duration: "7 min", type: "coding"  },
        { title: "Authentication with Devise",duration: "7 min", type: "coding"  },
        { title: "REST API with Rails",      duration: "8 min", type: "coding"  },
        { title: "Deploying to Heroku",      duration: "7 min", type: "setup"   },
      ]},
    ],
  },

  "swift": {
    title: "Swift & iOS", icon: "🍊", color: "#F05138", light: "#FFF3F0",
    level: "Intermediate", duration: "5 hrs",
    desc: "Build native iOS apps with Swift and SwiftUI.",
    skills: ["swift", "objective-c", "ios"],
    modules: [
      { title: "Swift Basics", lessons: [
        { title: "Xcode setup",             duration: "7 min", type: "setup"   },
        { title: "Variables & constants",   duration: "6 min", type: "coding"  },
        { title: "Optionals",               duration: "8 min", type: "coding"  },
        { title: "Control flow",            duration: "6 min", type: "coding"  },
      ]},
      { title: "Functions & Closures", lessons: [
        { title: "Functions",          duration: "6 min", type: "coding"  },
        { title: "Closures",           duration: "8 min", type: "coding"  },
        { title: "Higher-order functions",duration: "7 min", type: "coding" },
        { title: "Error handling",     duration: "6 min", type: "coding"  },
      ]},
      { title: "OOP & Protocols", lessons: [
        { title: "Classes & structs",  duration: "7 min", type: "coding"  },
        { title: "Protocols",          duration: "8 min", type: "coding"  },
        { title: "Extensions",         duration: "6 min", type: "coding"  },
        { title: "Generics",           duration: "6 min", type: "coding"  },
      ]},
      { title: "SwiftUI Basics", lessons: [
        { title: "Views & modifiers",  duration: "8 min", type: "coding"  },
        { title: "State & binding",    duration: "8 min", type: "coding"  },
        { title: "Lists & navigation", duration: "8 min", type: "coding"  },
        { title: "Networking with URLSession", duration: "8 min", type: "coding" },
      ]},
      { title: "iOS App Project", lessons: [
        { title: "App architecture (MVVM)", duration: "7 min", type: "reading" },
        { title: "Core Data basics",        duration: "8 min", type: "coding"  },
        { title: "Push notifications",      duration: "7 min", type: "coding"  },
        { title: "App Store submission",    duration: "6 min", type: "reading" },
      ]},
    ],
  },
};

// Generate direct article URLs for each lesson
const getResourceLinks = (courseId, lessonTitle) => {
  const slug = lessonTitle.toLowerCase()
    .replace(/[&/]/g, "-").replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const links = [];

  // GeeksforGeeks
  const gfgBase = {
    "python-basics":       "python",
    "data-science":        "python",
    "django-rest":         "django",
    "javascript-advanced": "javascript",
    "sql-databases":       "sql",
    "git-devops":          "git",
    "java-basics":         "java",
    "typescript":          "typescript",
    "golang":              "go",
    "rust-lang":           "rust",
    "kotlin":              "kotlin",
    "cpp":                 "cpp",
    "php":                 "php",
    "ruby":                "ruby",
    "swift":               "swift",
  };
  if (courseId === "web-dev") {
    const t = lessonTitle.toLowerCase();
    const ns = t.includes("html") || t.includes("document") || t.includes("semantic") || t.includes("form") || t.includes("accessibility") ? "html"
             : t.includes("css") || t.includes("box") || t.includes("flex") || t.includes("grid") || t.includes("responsive") ? "css"
             : t.includes("react") ? "reactjs" : "javascript";
    links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/${ns}/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
  } else if (gfgBase[courseId]) {
    links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/${gfgBase[courseId]}/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
  }

  // MDN / W3Schools
  if (courseId === "web-dev") {
    links.push({ label: "🌐 MDN Web Docs", url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(lessonTitle)}`, color: "#1565C0", bg: "#E3F2FD" });
  } else if (courseId === "javascript-advanced") {
    links.push({ label: "🌐 MDN Web Docs", url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(lessonTitle)}`, color: "#1565C0", bg: "#E3F2FD" });
  } else if (courseId === "sql-databases") {
    links.push({ label: "🌐 W3Schools SQL", url: `https://www.w3schools.com/sql/`, color: "#1565C0", bg: "#E3F2FD" });
  } else if (courseId === "java-basics") {
    links.push({ label: "🌐 W3Schools Java", url: `https://www.w3schools.com/java/`, color: "#1565C0", bg: "#E3F2FD" });
  } else {
    links.push({ label: "🌐 W3Schools", url: `https://www.w3schools.com/python/`, color: "#1565C0", bg: "#E3F2FD" });
  }

  // Official Docs
  const officialDocs = {
    "python-basics":       { label: "📘 Python Docs",     url: `https://docs.python.org/3/search.html?q=${encodeURIComponent(lessonTitle)}` },
    "data-science":        { label: "📘 Python Docs",     url: `https://docs.python.org/3/search.html?q=${encodeURIComponent(lessonTitle)}` },
    "django-rest":         { label: "📘 Django Docs",     url: `https://docs.djangoproject.com/en/stable/search/?q=${encodeURIComponent(lessonTitle)}` },
    "web-dev":             { label: "📘 React Docs",      url: "https://react.dev/learn" },
    "javascript-advanced": { label: "📘 Node.js Docs",    url: "https://nodejs.org/en/docs" },
    "sql-databases":       { label: "📘 PostgreSQL Docs", url: `https://www.postgresql.org/search/?q=${encodeURIComponent(lessonTitle)}` },
    "git-devops":          { label: "📘 Git Docs",        url: "https://git-scm.com/doc" },
    "java-basics":         { label: "📘 Java Docs",       url: "https://docs.oracle.com/en/java/" },
    "typescript":          { label: "📘 TS Docs",         url: "https://www.typescriptlang.org/docs/" },
    "golang":              { label: "📘 Go Docs",         url: `https://pkg.go.dev/search?q=${encodeURIComponent(lessonTitle)}` },
    "rust-lang":           { label: "📘 Rust Docs",       url: "https://doc.rust-lang.org/book/" },
    "kotlin":              { label: "📘 Kotlin Docs",     url: "https://kotlinlang.org/docs/" },
    "cpp":                 { label: "📘 cppreference",    url: `https://en.cppreference.com/mwiki/index.php?search=${encodeURIComponent(lessonTitle)}` },
    "php":                 { label: "📘 PHP Docs",        url: `https://www.php.net/search.php?show=quickref&pattern=${encodeURIComponent(lessonTitle)}` },
    "ruby":                { label: "📘 Ruby Docs",       url: "https://ruby-doc.org/" },
    "swift":               { label: "📘 Swift Docs",      url: "https://developer.apple.com/documentation/swift" },
  };
  if (officialDocs[courseId]) {
    links.push({ ...officialDocs[courseId], color: "#E65100", bg: "#FFF3E0" });
  }

  return links;
};

const TYPE_META = {
  reading: { label: "Reading", color: "#2563EB", bg: "#EFF6FF", icon: "📖" },
  coding:  { label: "Coding",  color: "#059669", bg: "#ECFDF5", icon: "💻" },
  setup:   { label: "Setup",   color: "#D97706", bg: "#FFFBEB", icon: "⚙️" },
};
export default function LearningPath() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const course = COURSES[courseId];

  const [completed, setCompleted] = useState({});
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null); // "mi-li"
  const [openModules, setOpenModules] = useState({ 0: true });

  // Load progress from backend
  useEffect(() => {
    if (!course) { setLoading(false); return; }
    api.get(`/courses/progress/${courseId}/`)
      .then(r => {
        setCompleted(r.data.completed || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get(`/courses/certificate/${courseId}/`)
      .then(r => setCertificate(r.data))
      .catch(() => {});
  }, [courseId, course]);

  // Save progress to backend
  const saveProgress = useCallback((newCompleted) => {
    api.post(`/courses/progress/${courseId}/`, { completed: newCompleted })
      .then(r => { if (r.data.certificate) setCertificate(r.data.certificate); })
      .catch(() => {});
  }, [courseId]);

  const toggle = (key) => {
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    saveProgress(next);
  };

  const toggleModule = (mi) => setOpenModules(p => ({ ...p, [mi]: !p[mi] }));

  if (!course) return (
    <div className="lp-page">
      <p className="lp-not-found">Course not found. <Link to="/prep">← Back to Prep Hub</Link></p>
    </div>
  );

  if (loading) return <div className="lp-page"><p className="lp-loading">Loading course…</p></div>;

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const doneCount    = Object.values(completed).filter(Boolean).length;
  const pct          = Math.round((doneCount / totalLessons) * 100);
  const allDone      = doneCount === totalLessons;

  return (
    <div className="lp-page">
      <Link to="/prep" className="lp-back">← Back to Prep Hub</Link>

      {/* ── Course Header ── */}
      <div className="lp-header" style={{ "--lc": course.color, "--ll": course.light }}>
        <div className="lp-header-left">
          <span className="lp-icon">{course.icon}</span>
          <div>
            <div className="lp-meta">
              <span className="lp-level">{course.level}</span>
              <span className="lp-dur">⏱ {course.duration}</span>
              <span className="lp-dur">📚 {totalLessons} lessons</span>
              <span className="lp-dur">📦 {course.modules.length} modules</span>
            </div>
            <h1>{course.title}</h1>
            <p>{course.desc}</p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="lp-progress-box">
          <div className="lp-ring-wrap">
            <svg viewBox="0 0 64 64" width="80" height="80">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
              <circle cx="32" cy="32" r="28" fill="none" stroke={course.color} strokeWidth="5"
                strokeDasharray={`${pct * 1.759} 175.9`} strokeLinecap="round"
                transform="rotate(-90 32 32)" style={{ transition: "stroke-dasharray 0.4s" }} />
            </svg>
            <div className="lp-ring-label">
              <strong style={{ color: course.color }}>{pct}%</strong>
              <span>{doneCount}/{totalLessons}</span>
            </div>
          </div>
          {allDone
            ? <Link to={`/prep/certificate/${courseId}`} className="lp-btn-cert" style={{ background: course.color }}>🎓 Get Certificate</Link>
            : <p className="lp-ring-hint">{totalLessons - doneCount} lessons left</p>
          }
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="lp-prog-bar-wrap">
        <div className="lp-prog-bar-track">
          <div className="lp-prog-bar-fill" style={{ width: `${pct}%`, background: course.color }} />
        </div>
        <span>{pct}% complete</span>
      </div>

      {/* ── Modules ── */}
      <div className="lp-modules">
        {course.modules.map((mod, mi) => {
          const modDone  = mod.lessons.filter((_, li) => completed[`${mi}-${li}`]).length;
          const modTotal = mod.lessons.length;
          const modPct   = Math.round((modDone / modTotal) * 100);
          const isOpen   = !!openModules[mi];

          return (
            <div key={mi} className={`lp-module ${isOpen ? "open" : ""}`}>
              {/* Module header — click to expand/collapse */}
              <div className="lp-module-header" onClick={() => toggleModule(mi)}>
                <div className="lp-module-left">
                  <span className="lp-module-num">Module {mi + 1}</span>
                  <h3>{mod.title}</h3>
                </div>
                <div className="lp-module-right">
                  <div className="lp-mod-prog-bar">
                    <div style={{ width: `${modPct}%`, background: course.color }} />
                  </div>
                  <span className="lp-module-count" style={{ color: modDone === modTotal ? course.color : "var(--muted)" }}>
                    {modDone === modTotal ? "✓" : `${modDone}/${modTotal}`}
                  </span>
                  <span className="lp-chevron">{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Lessons */}
              {isOpen && (
                <div className="lp-lessons">
                  {mod.lessons.map((lesson, li) => {
                    const key  = `${mi}-${li}`;
                    const done = !!completed[key];
                    const meta = TYPE_META[lesson.type] || TYPE_META.reading;
                    const isActive = activeLesson === key;

                    return (
                      <div key={li} className={`lp-lesson-wrap ${done ? "done" : ""} ${isActive ? "active" : ""}`}>
                        <div className="lp-lesson" onClick={() => setActiveLesson(isActive ? null : key)}>
                          <button
                            className="lp-check-btn"
                            style={{ borderColor: course.color, background: done ? course.color : "transparent" }}
                            onClick={e => { e.stopPropagation(); toggle(key); }}
                            title={done ? "Mark incomplete" : "Mark complete"}
                          >
                            {done && <span>✓</span>}
                          </button>
                          <div className="lp-lesson-info">
                            <span className="lp-lesson-title">{lesson.title}</span>
                            <div className="lp-lesson-meta">
                              <span className="lp-type-badge" style={{ color: meta.color, background: meta.bg }}>
                                {meta.icon} {meta.label}
                              </span>
                              <span className="lp-lesson-dur">⏱ {lesson.duration}</span>
                            </div>
                          </div>
                          <span className="lp-expand-icon">{isActive ? "▲" : "▼"}</span>
                        </div>

                        {/* Lesson content panel */}
                        {isActive && (
                          <div className="lp-lesson-content">
                            <p className="lp-content-note">
                              📌 This lesson covers <strong>{lesson.title}</strong> — part of the <em>{mod.title}</em> module.
                              Study the concept, practice the examples, then mark it complete.
                            </p>
                            <div className="lp-content-actions">
                              {getResourceLinks(courseId, lesson.title).map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noreferrer"
                                  className="lp-ref-btn"
                                  style={{ background: link.bg, color: link.color, border: `1px solid ${link.color}33` }}>
                                  {link.label}
                                </a>
                              ))}
                            </div>
                            {!done && (
                              <button
                                className="lp-mark-btn"
                                style={{ background: course.color }}
                                onClick={() => toggle(key)}
                              >
                                ✓ Mark as Complete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Completion banner ── */}
      {allDone && (
        <div className="lp-complete-banner" style={{ borderColor: course.color, background: course.light }}>
          <span>🎉</span>
          <div>
            <strong>Course Complete!</strong>
            <p>You've finished all {totalLessons} lessons. Claim your certificate now.</p>
          </div>
          <Link to={`/prep/certificate/${courseId}`} className="lp-btn-cert" style={{ background: course.color }}>
            Get Certificate →
          </Link>
        </div>
      )}
    </div>
  );
}
