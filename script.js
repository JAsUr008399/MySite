document.addEventListener("DOMContentLoaded", () => {

    /* ============================
       JASUR // DIGITAL WORLD
       SYSTEM CORE
    ============================ */

    console.log(
        "%c JASUR // DIGITAL WORLD ",
        "background:#00ff88;color:#001b0e;font-size:18px;font-weight:bold;padding:8px;"
    );

    /* ===== MOBILE MENU ===== */

    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", () => {
            mobileMenu.classList.toggle("active");
        });

        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("active");
            });
        });
    }


    /* ===== NOTIFICATIONS ===== */

    function notify(message) {
        const notification = document.createElement("div");

        notification.className = "notification";
        notification.textContent = message;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add("show");
        });

        setTimeout(() => {
            notification.classList.remove("show");

            setTimeout(() => {
                notification.remove();
            }, 350);
        }, 2200);
    }


    /* ===== TERMINAL ===== */

    const terminalOpen = document.getElementById("terminalOpen");
    const terminalClose = document.getElementById("terminalClose");
    const terminalWindow = document.getElementById("terminalWindow");
    const terminalInput = document.getElementById("terminalInput");
    const terminalOutput = document.getElementById("terminalOutput");

    function printTerminal(text) {
        const line = document.createElement("p");
        line.innerHTML = text;

        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    terminalOpen?.addEventListener("click", () => {
        terminalWindow.classList.add("active");

        setTimeout(() => {
            terminalInput.focus();
        }, 200);
    });

    terminalClose?.addEventListener("click", () => {
        terminalWindow.classList.remove("active");
    });


    /* ===== TERMINAL COMMANDS ===== */

    function runCommand(rawCommand) {

        const command = rawCommand.trim().toLowerCase();

        if (!command) return;

        printTerminal(
            `<span style="color:#00ff88">jasur@system:~$</span> ${escapeHTML(rawCommand)}`
        );

        switch (command) {

            case "help":
                printTerminal(`
                    <b>AVAILABLE COMMANDS</b><br><br>
                    help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; show commands<br>
                    about &nbsp;&nbsp;&nbsp;&nbsp; about JASUR DIGITAL WORLD<br>
                    projects &nbsp; show projects<br>
                    skills &nbsp;&nbsp;&nbsp; show technologies<br>
                    status &nbsp;&nbsp;&nbsp; system status<br>
                    time &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; current time<br>
                    date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; current date<br>
                    contact &nbsp;&nbsp; open contact section<br>
                    matrix &nbsp;&nbsp;&nbsp; visual matrix mode<br>
                    clear &nbsp;&nbsp;&nbsp;&nbsp; clear terminal
                `);
                break;

            case "about":
                printTerminal(
                    "JASUR // DIGITAL WORLD<br>Personal digital portfolio and experimental interface."
                );
                break;

            case "projects":
                printTerminal(`
                    [01] NEON PORTFOLIO<br>
                    [02] JASUR TERMINAL<br>
                    [03] DIGITAL LAB
                `);
                break;

            case "skills":
                printTerminal(
                    "HTML // CSS // JAVASCRIPT // POWERSHELL // WEB DESIGN"
                );
                break;

            case "status":
                printTerminal(`
                    WEBSITE ........ <b>ONLINE</b><br>
                    TERMINAL ....... <b>ONLINE</b><br>
                    JAVASCRIPT ..... <b>ACTIVE</b><br>
                    SECURITY ....... <b>LOCAL MODE</b>
                `);
                break;

            case "time":
                printTerminal(
                    new Date().toLocaleTimeString()
                );
                break;

            case "date":
                printTerminal(
                    new Date().toLocaleDateString()
                );
                break;

            case "contact":
                printTerminal("Opening contact section...");

                document
                    .getElementById("contact")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

                break;

            case "matrix":
                printTerminal("Starting MATRIX visual mode...");
                startMatrix();
                break;

            case "clear":
                terminalOutput.innerHTML = "";
                break;

            default:
                printTerminal(
                    `Command not found: <b>${escapeHTML(rawCommand)}</b><br>Type <b>help</b>.`
                );
        }
    }


    terminalInput?.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            runCommand(terminalInput.value);

            terminalInput.value = "";
        }

    });


    /* ===== SAFE TERMINAL TEXT ===== */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    /* ===== MATRIX VISUAL EFFECT ===== */

    function startMatrix() {

        if (document.getElementById("matrixCanvas")) {
            return;
        }

        const canvas = document.createElement("canvas");

        canvas.id = "matrixCanvas";

        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();

        const characters =
            "01JASUR<>[]{}#$@DIGITAL";

        const fontSize = 15;

        let columns =
            Math.ceil(canvas.width / fontSize);

        let drops =
            new Array(columns).fill(1);

        const interval = setInterval(() => {

            ctx.fillStyle =
                "rgba(0,0,0,0.08)";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.fillStyle = "#00ff88";

            ctx.font =
                fontSize + "px monospace";

            for (
                let i = 0;
                i < drops.length;
                i++
            ) {

                const char =
                    characters[
                        Math.floor(
                            Math.random() *
                            characters.length
                        )
                    ];

                ctx.fillText(
                    char,
                    i * fontSize,
                    drops[i] * fontSize
                );

                if (
                    drops[i] * fontSize >
                        canvas.height &&
                    Math.random() > 0.975
                ) {
                    drops[i] = 0;
                }

                drops[i]++;
            }

        }, 40);

        setTimeout(() => {

            clearInterval(interval);

            canvas.remove();

        }, 5000);
    }


    /* ===== SCROLL ANIMATIONS ===== */

    const revealItems =
        document.querySelectorAll(
            ".card, .project-card, .section-heading, .skill, .contact-box"
        );

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "reveal-visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }

                });

            },
            {
                threshold: 0.12
            }
        );

    revealItems.forEach(item => {

        item.classList.add("reveal");

        observer.observe(item);
    });


    /* ===== PROJECT BUTTONS ===== */

    document
        .querySelectorAll(".project-button")
        .forEach((button, index) => {

            button.addEventListener(
                "click",
                () => {

                    const names = [
                        "NEON PORTFOLIO",
                        "JASUR TERMINAL",
                        "DIGITAL LAB"
                    ];

                    notify(
                        names[index] +
                        " // PROJECT SELECTED"
                    );
                }
            );

        });


    /* ===== CONTACT FORM ===== */

    const contactForm =
        document.getElementById("contactForm");

    contactForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            notify(
                "MESSAGE READY // DEMO MODE"
            );

            contactForm.reset();
        }
    );


    /* ===== HERO TERMINAL TYPING ===== */

    const terminalHero =
        document.querySelector(
            ".hero-terminal"
        );

    if (terminalHero) {

        setTimeout(() => {

            terminalHero.classList.add(
                "terminal-loaded"
            );

        }, 400);
    }


    /* ===== EASTER EGG ===== */

    let secretKeys = "";

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.target.tagName === "INPUT" ||
                event.target.tagName === "TEXTAREA"
            ) {
                return;
            }

            secretKeys +=
                event.key.toLowerCase();

            secretKeys =
                secretKeys.slice(-10);

            if (
                secretKeys.includes("jasur")
            ) {

                notify(
                    "⚡ JASUR MODE ACTIVATED"
                );

                startMatrix();

                secretKeys = "";
            }

        }
    );


    /* ===== READY ===== */

    setTimeout(() => {
        notify("SYSTEM ONLINE");
    }, 700);


    /* ===== СИСТЕМА ВХОДА / РЕГИСТРАЦИИ ===== */

    const authOpen = document.getElementById("authOpen");
    const authClose = document.getElementById("authClose");
    const authOverlay = document.getElementById("authOverlay");

    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const authQuestion = document.getElementById("authQuestion");
    const authSwitch = document.getElementById("authSwitch");
    const authSubmit = document.getElementById("authSubmit");

    const authName = document.getElementById("authName");
    const authLogin = document.getElementById("authLogin");
    const authPassword = document.getElementById("authPassword");

    const nameField = document.getElementById("nameField");
    const showPassword = document.getElementById("showPassword");

let registerMode = false;

const savedUser = localStorage.getItem("currentUser");

if (savedUser) {
    try {
        const user = JSON.parse(savedUser);

        authOpen.textContent =
            (user.name || user.login).toUpperCase();

    } catch {
        localStorage.removeItem("currentUser");
    }
}

const profileMenu = document.getElementById("profileMenu");
const profileName = document.getElementById("profileName");
const profileButton = document.getElementById("profileButton");
const logoutButton = document.getElementById("logoutButton");

authOpen?.addEventListener("click", () => {
    const currentUser = localStorage.getItem("currentUser");

    if (currentUser) {
        const user = JSON.parse(currentUser);

        profileName.textContent =
            (user.name || user.login || "USER").toUpperCase();

        profileMenu.classList.toggle("active");
        return;
    }

    authOverlay.classList.add("active");
    setTimeout(() => authLogin.focus(), 200);
});

logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");

    profileMenu.classList.remove("active");
    authOpen.textContent = "ВОЙТИ";

    notify("ВЫ ВЫШЛИ ИЗ АККАУНТА");
});

profileButton?.addEventListener("click", () => {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) return;

    const user = JSON.parse(currentUser);

    notify(
        "ПРОФИЛЬ // " +
        (user.name || user.login || "USER").toUpperCase()
    );
});
 
    authClose?.addEventListener("click", () => {
        authOverlay.classList.remove("active");
    });

    authOverlay?.addEventListener("click", event => {
        if (event.target === authOverlay) {
            authOverlay.classList.remove("active");
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            authOverlay?.classList.remove("active");
        }
    });

    authSwitch?.addEventListener("click", () => {

        registerMode = !registerMode;

        if (registerMode) {

            authTitle.textContent = "СОЗДАНИЕ АККАУНТА";

            authQuestion.textContent =
                "Уже есть аккаунт?";

            authSwitch.textContent =
                "ВОЙТИ";

            authSubmit.textContent =
                "СОЗДАТЬ АККАУНТ →";

            nameField.classList.remove("hidden");

        } else {

            authTitle.textContent =
                "ВХОД В СИСТЕМУ";

            authQuestion.textContent =
                "Нет аккаунта?";

            authSwitch.textContent =
                "СОЗДАТЬ";

            authSubmit.textContent =
                "ВОЙТИ →";

            nameField.classList.add("hidden");
        }
    });

showPassword?.addEventListener("click", () => {
    const hidden = authPassword.type === "password";

    authPassword.type = hidden ? "text" : "password";

    showPassword.textContent = hidden ? "◎" : "◉";

});
  
  authForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const login = authLogin.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();

    if (!login || !password || (registerMode && !name)) {
        notify("Заполни все поля");
        return;
    }

    try {
        const endpoint = registerMode ? "/api/register" : "/api/login";

        const payload = registerMode
            ? { name, login, password }
            : { login, password };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            notify(data.message || "Ошибка");
            return;
        }

        notify(data.message || "Готово");

        authOpen.textContent =
            (data.user?.name || data.user?.login || login).toUpperCase();
localStorage.setItem("currentUser", JSON.stringify(data.user));
        authPassword.value = "";
        authOverlay.classList.remove("active");

    } catch (error) {
        notify("Сервер недоступен");
    }
});

});


