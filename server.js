const http = require("http");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// =========================
// POSTGRESQL
// =========================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});

async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            login VARCHAR(100) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("DATABASE // READY");
}

// =========================
// HELPERS
// =========================

function sendJSON(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;

            if (body.length > 1_000_000) {
                reject(new Error("Request too large"));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                reject(new Error("Invalid JSON"));
            }
        });

        req.on("error", reject);
    });
}

// =========================
// ADMIN AUTH
// =========================

function adminAuthorized(req) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Basic ")) {
        return false;
    }

    try {
        const decoded = Buffer
            .from(auth.substring(6), "base64")
            .toString("utf8");

        const separator = decoded.indexOf(":");

        if (separator === -1) return false;

        const login = decoded.substring(0, separator);
        const password = decoded.substring(separator + 1);

        return (
            login === ADMIN_LOGIN &&
            password === ADMIN_PASSWORD
        );
    } catch {
        return false;
    }
}

function requireAdmin(req, res) {
    if (adminAuthorized(req)) {
        return true;
    }

    res.writeHead(401, {
        "WWW-Authenticate": 'Basic realm="MySite Admin"',
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Требуется вход администратора");

    return false;
}

// =========================
// ADMIN PAGE
// =========================

function adminPage() {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>MySite // Admin</title>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    background: #020806;
    color: #d7ffe9;
    font-family: Consolas, monospace;
}

header {
    padding: 25px 35px;
    border-bottom: 1px solid #00ff88;
    background: #03110c;
}

h1 {
    margin: 0;
    color: #00ff88;
    letter-spacing: 3px;
}

.status {
    margin-top: 8px;
    color: #7affbd;
}

main {
    max-width: 1200px;
    margin: auto;
    padding: 30px;
}

.card {
    background: #03110c;
    border: 1px solid #0a4b32;
    padding: 20px;
    box-shadow: 0 0 30px rgba(0,255,136,.08);
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
}

.counter {
    color: #00ff88;
}

button {
    background: transparent;
    color: #00ff88;
    border: 1px solid #00ff88;
    padding: 10px 18px;
    cursor: pointer;
    font-family: inherit;
}

button:hover {
    background: #00ff88;
    color: #00150d;
}

.table-wrap {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    text-align: left;
    padding: 14px;
    border-bottom: 1px solid #123629;
}

th {
    color: #00ff88;
}

.loading {
    padding: 25px;
    text-align: center;
    color: #00ff88;
}

.error {
    color: #ff5c77;
}

</style>
</head>

<body>

<header>
    <h1>JASUR // ADMIN PANEL</h1>
    <div class="status">● SYSTEM ONLINE</div>
</header>

<main>

<div class="card">

    <div class="top">
        <div>
            USERS //
            <span id="counter" class="counter">0</span>
        </div>

        <button onclick="loadUsers()">
            ОБНОВИТЬ
        </button>
    </div>

    <div class="table-wrap">

        <table>

            <thead>
                <tr>
                    <th>ID</th>
                    <th>ИМЯ</th>
                    <th>ЛОГИН</th>
                    <th>РЕГИСТРАЦИЯ</th>
                </tr>
            </thead>

            <tbody id="users">
                <tr>
                    <td colspan="4" class="loading">
                        ЗАГРУЗКА...
                    </td>
                </tr>
            </tbody>

        </table>

    </div>

</div>

</main>

<script>

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

async function loadUsers() {

    const table = document.getElementById("users");
    const counter = document.getElementById("counter");

    try {

        const response = await fetch("/api/admin/users");

        if (!response.ok) {
            throw new Error("Ошибка доступа");
        }

        const data = await response.json();

        counter.textContent = data.users.length;

        if (data.users.length === 0) {

            table.innerHTML = \`
                <tr>
                    <td colspan="4" class="loading">
                        ПОЛЬЗОВАТЕЛЕЙ ПОКА НЕТ
                    </td>
                </tr>
            \`;

            return;
        }

        table.innerHTML = data.users.map(user => \`

            <tr>

                <td>\${user.id}</td>

                <td>
                    \${escapeHTML(user.name)}
                </td>

                <td>
                    \${escapeHTML(user.login)}
                </td>

                <td>
                    \${new Date(user.created_at).toLocaleString()}
                </td>

            </tr>

        \`).join("");

    } catch (error) {

        table.innerHTML = \`
            <tr>
                <td colspan="4" class="loading error">
                    НЕ УДАЛОСЬ ЗАГРУЗИТЬ ПОЛЬЗОВАТЕЛЕЙ
                </td>
            </tr>
        \`;

    }
}

loadUsers();

</script>

</body>
</html>
`;
}

// =========================
// SERVER
// =========================

const server = http.createServer(async (req, res) => {

    try {

        const url = new URL(
            req.url,
            "http://" + req.headers.host
        );

        // =====================
        // REGISTER
        // =====================

        if (
            req.method === "POST" &&
            url.pathname === "/api/register"
        ) {

            const body = await readBody(req);

            const name =
                String(body.name || "").trim();

            const login =
                String(body.login || "").trim();

            const password =
                String(body.password || "");

            if (name.length < 2) {
                return sendJSON(res, 400, {
                    message: "Имя слишком короткое"
                });
            }

            if (login.length < 3) {
                return sendJSON(res, 400, {
                    message: "Логин должен содержать минимум 3 символа"
                });
            }

            if (password.length < 6) {
                return sendJSON(res, 400, {
                    message: "Пароль должен содержать минимум 6 символов"
                });
            }

            const exists = await pool.query(
                `
                SELECT id
                FROM users
                WHERE LOWER(login) = LOWER($1)
                `,
                [login]
            );

            if (exists.rows.length > 0) {
                return sendJSON(res, 409, {
                    message: "Такой логин уже существует"
                });
            }

            const passwordHash =
                await bcrypt.hash(password, 12);

            const result = await pool.query(
                `
                INSERT INTO users
                    (name, login, password_hash)
                VALUES
                    ($1, $2, $3)
                RETURNING
                    id,
                    name,
                    login,
                    created_at
                `,
                [
                    name,
                    login,
                    passwordHash
                ]
            );

            return sendJSON(res, 201, {
                message: "Аккаунт создан",
                user: result.rows[0]
            });
        }

        // =====================
        // LOGIN
        // =====================

        if (
            req.method === "POST" &&
            url.pathname === "/api/login"
        ) {

            const body = await readBody(req);

            const login =
                String(body.login || "").trim();

            const password =
                String(body.password || "");

            const result = await pool.query(
                `
                SELECT *
                FROM users
                WHERE LOWER(login) = LOWER($1)
                LIMIT 1
                `,
                [login]
            );

            if (result.rows.length === 0) {
                return sendJSON(res, 401, {
                    message: "Неверный логин или пароль"
                });
            }

            const user = result.rows[0];

            const correct =
                await bcrypt.compare(
                    password,
                    user.password_hash
                );

            if (!correct) {
                return sendJSON(res, 401, {
                    message: "Неверный логин или пароль"
                });
            }

            return sendJSON(res, 200, {
                message: "Вход выполнен",
                user: {
                    id: user.id,
                    name: user.name,
                    login: user.login,
                    created_at: user.created_at
                }
            });
        }

        // =====================
        // ADMIN USERS API
        // =====================

        if (
            req.method === "GET" &&
            url.pathname === "/api/admin/users"
        ) {

            if (!requireAdmin(req, res)) {
                return;
            }

            const result = await pool.query(`
                SELECT
                    id,
                    name,
                    login,
                    created_at
                FROM users
                ORDER BY id DESC
            `);

            return sendJSON(res, 200, {
                users: result.rows
            });
        }

        // =====================
        // ADMIN PAGE
        // =====================

        if (
            req.method === "GET" &&
            (
                url.pathname === "/admin" ||
                url.pathname === "/admin/"
            )
        ) {

            if (!requireAdmin(req, res)) {
                return;
            }

            res.writeHead(200, {
                "Content-Type":
                    "text/html; charset=utf-8"
            });

            return res.end(adminPage());
        }

        // =====================
        // STATIC FILES
        // =====================

        let requestPath =
            url.pathname === "/"
                ? "/index.html"
                : url.pathname;

        const blocked = [
            "/server.js",
            "/package.json",
            "/package-lock.json",
            "/users.json",
            "/.gitignore",
            "/.env"
        ];

        if (blocked.includes(requestPath)) {
            res.writeHead(403);
            return res.end("Forbidden");
        }

        requestPath = decodeURIComponent(requestPath);

        const root = path.resolve(__dirname);

        const filePath = path.resolve(
            root,
            "." + requestPath
        );

        if (
            filePath !== root &&
            !filePath.startsWith(root + path.sep)
        ) {
            res.writeHead(403);
            return res.end("Forbidden");
        }

        fs.stat(filePath, (error, stats) => {

            if (
                error ||
                !stats.isFile()
            ) {
                res.writeHead(404, {
                    "Content-Type":
                        "text/plain; charset=utf-8"
                });

                return res.end("404 // NOT FOUND");
            }

            const extension =
                path.extname(filePath).toLowerCase();

            const types = {
                ".html": "text/html; charset=utf-8",
                ".css": "text/css; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".json": "application/json; charset=utf-8",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".svg": "image/svg+xml",
                ".ico": "image/x-icon",
                ".webp": "image/webp"
            };

            res.writeHead(200, {
                "Content-Type":
                    types[extension] ||
                    "application/octet-stream"
            });

            fs.createReadStream(filePath).pipe(res);
        });

    } catch (error) {

        console.error(error);

        if (!res.headersSent) {
            sendJSON(res, 500, {
                message: "Ошибка сервера"
            });
        }
    }
});

// =========================
// START
// =========================

async function start() {

    try {

        await initDatabase();

        server.listen(
            PORT,
            HOST,
            () => {
                console.log(
                    "JASUR // ЦИФРОВОЙ МИР"
                );

                console.log(
                    "SERVER // ONLINE //" +
                    PORT
                );
            }
        );

    } catch (error) {

        console.error(
            "DATABASE ERROR:",
            error
        );

        process.exit(1);
    }
}

start();