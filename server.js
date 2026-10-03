const http = require("http");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const USERS_FILE = path.join(ROOT, "users.json");

const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
};

/* ===== USERS ===== */

function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }

        return JSON.parse(
            fs.readFileSync(USERS_FILE, "utf8")
        );
    } catch {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

function sendJSON(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(data));
}

function getBody(req) {
    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {

            body += chunk;

            if (body.length > 100000) {
                reject(new Error("Слишком большой запрос"));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch {
                reject(new Error("Некорректный JSON"));
            }
        });

        req.on("error", reject);
    });
}


/* ===== SERVER ===== */

const server = http.createServer(async (req, res) => {

    /* ===== REGISTRATION API ===== */

    if (
        req.method === "POST" &&
        req.url === "/api/register"
    ) {
        try {

            const body = await getBody(req);

            const name =
                String(body.name || "").trim();

            const login =
                String(body.login || "").trim();

            const password =
                String(body.password || "");

            if (
                name.length < 2 ||
                login.length < 3 ||
                password.length < 6
            ) {
                return sendJSON(res, 400, {
                    success: false,
                    message:
                        "Имя — от 2 символов, логин — от 3, пароль — от 6."
                });
            }

            const users = readUsers();

            const exists = users.some(
                user =>
                    user.login.toLowerCase() ===
                    login.toLowerCase()
            );

            if (exists) {
                return sendJSON(res, 409, {
                    success: false,
                    message:
                        "Такой логин уже существует."
                });
            }

            const passwordHash =
                await bcrypt.hash(password, 12);

            users.push({
                id: Date.now(),
                name,
                login,
                passwordHash,
                createdAt:
                    new Date().toISOString()
            });

            saveUsers(users);

            return sendJSON(res, 201, {
                success: true,
                message:
                    "Аккаунт успешно создан.",
                user: {
                    name,
                    login
                }
            });

        } catch (error) {

            return sendJSON(res, 400, {
                success: false,
                message: "Ошибка запроса."
            });
        }
    }


    /* ===== LOGIN API ===== */

    if (
        req.method === "POST" &&
        req.url === "/api/login"
    ) {
        try {

            const body = await getBody(req);

            const login =
                String(body.login || "").trim();

            const password =
                String(body.password || "");

            const users = readUsers();

            const user = users.find(
                item =>
                    item.login.toLowerCase() ===
                    login.toLowerCase()
            );

            if (!user) {
                return sendJSON(res, 401, {
                    success: false,
                    message:
                        "Неверный логин или пароль."
                });
            }

            const valid =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );

            if (!valid) {
                return sendJSON(res, 401, {
                    success: false,
                    message:
                        "Неверный логин или пароль."
                });
            }

            return sendJSON(res, 200, {
                success: true,
                message: "Вход выполнен.",
                user: {
                    name: user.name,
                    login: user.login
                }
            });

        } catch {

            return sendJSON(res, 400, {
                success: false,
                message: "Ошибка запроса."
            });
        }
    }


    /* ===== STATIC WEBSITE ===== */

    let requestPath =
        req.url.split("?")[0];

    if (requestPath === "/") {
        requestPath = "/index.html";
    }

    // users.json никогда не отдаём браузеру
    if (
        requestPath === "/users.json" ||
        requestPath === "/package.json" ||
        requestPath === "/package-lock.json"
    ) {
        res.writeHead(403);
        return res.end("Доступ запрещён");
    }

    const decodedPath =
        decodeURIComponent(requestPath);

    const filePath =
        path.resolve(
            ROOT,
            "." + decodedPath
        );

    const relative =
        path.relative(ROOT, filePath);

    if (
        relative.startsWith("..") ||
        path.isAbsolute(relative)
    ) {
        res.writeHead(403, {
            "Content-Type":
                "text/plain; charset=utf-8"
        });

        return res.end("Доступ запрещён");
    }

    fs.stat(filePath, (error, stats) => {

        if (
            error ||
            !stats.isFile()
        ) {
            res.writeHead(404, {
                "Content-Type":
                    "text/html; charset=utf-8"
            });

            return res.end(`
                <h1>404</h1>
                <p>Страница не найдена</p>
            `);
        }

        const ext =
            path.extname(filePath)
                .toLowerCase();

        res.writeHead(200, {
            "Content-Type":
                types[ext] ||
                "application/octet-stream"
        });

        fs.createReadStream(filePath)
            .pipe(res);
    });

});


server.listen(PORT, "0.0.0.0", () => {

        console.log("");
        console.log(
            "================================"
        );

        console.log(
            " JASUR // ЦИФРОВОЙ МИР"
        );

        console.log(
            "================================"
        );

        console.log("");
        console.log(
            ` Сервер: http://localhost:${PORT}`
        );

        console.log(
            " Авторизация: активна"
        );

        console.log(
            " Пароли: bcrypt hash"
        );

        console.log("");
        console.log(
            " Ctrl+C — остановить сервер"
        );
        console.log("");
    }
);
