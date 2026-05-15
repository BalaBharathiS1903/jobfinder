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
