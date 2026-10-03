document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       JASUR DIGITAL WORLD
       ADVANCED INTERACTION
    ========================= */

    console.log("%c JASUR DIGITAL WORLD ", "background:#00ff88;color:#000;font-size:18px;font-weight:bold");
    console.log("System initialized.");

    /* ---------- NOTIFICATION ---------- */

    function notify(text) {
        const box = document.createElement("div");
        box.className = "js-notification";
        box.textContent = text;
        document.body.appendChild(box);

        setTimeout(() => box.classList.add("show"), 10);

        setTimeout(() => {
            box.classList.remove("show");
            setTimeout(() => box.remove(), 400);
        }, 2500);
    }

    /* ---------- TERMINAL ---------- */

    const terminal = document.createElement("div");
    terminal.id = "jasur-terminal";

    terminal.innerHTML = `
        <div class="terminal-head">
            <span>● JASUR TERMINAL</span>
            <button id="terminal-close">×</button>
        </div>

        <div id="terminal-output">
            <div>JASUR OS [Version 1.0]</div>
            <div>Secure local interface initialized.</div>
            <div>Type <b>help</b> to see available commands.</div>
            <br>
        </div>

        <div class="terminal-input-line">
            <span>jasur@system:~$</span>
            <input id="terminal-input" autocomplete="off">
        </div>
    `;

    document.body.appendChild(terminal);

    const terminalButton = document.createElement("button");
    terminalButton.id = "terminal-open";
    terminalButton.textContent = "⌁ TERMINAL";
    document.body.appendChild(terminalButton);

    const output = document.getElementById("terminal-output");
    const input = document.getElementById("terminal-input");

    function print(text) {
        const line = document.createElement("div");
        line.innerHTML = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function runCommand(command) {

        const cmd = command.trim().toLowerCase();

        if (!cmd) return;

        print(`<span class="cmd">jasur@system:~$ ${command}</span>`);

        switch (cmd) {

            case "help":
                print(`
                    <b>Available commands:</b><br>
                    help — show commands<br>
                    about — information about the site<br>
                    projects — show projects<br>
                    skills — show skills<br>
                    time — show local browser time<br>
                    clear — clear terminal<br>
                    status — system status<br>
                    matrix — activate visual effect<br>
                    contact — show contact section
                `);
                break;

            case "about":
                print("JASUR DIGITAL WORLD — personal developer interface.");
                break;

            case "projects":
                print("Projects:");
                print("01 — Neon Portfolio");
                print("02 — Interactive Terminal");
                print("03 — Web Experiments");
                break;

            case "skills":
                print("HTML • CSS • JavaScript • PowerShell • Web Design");
                break;

            case "time":
                print(new Date().toLocaleString());
                break;

            case "status":
                print("SYSTEM: ONLINE<br>INTERFACE: ONLINE<br>JAVASCRIPT: ACTIVE");
                break;

            case "contact":
                document.querySelector("#contact")?.scrollIntoView({
                    behavior: "smooth"
                });
                print("Opening contact section...");
                break;

            case "clear":
                output.innerHTML = "";
                break;

            case "matrix":
                matrixEffect();
                print("Visual mode activated.");
                break;

            default:
                print(`Unknown command: <b>${command}</b><br>Type <b>help</b>.`);
        }
    }

    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            runCommand(input.value);
            input.value = "";
        }
    });

    terminalButton.onclick = () => {
        terminal.classList.toggle("terminal-visible");

        if (terminal.classList.contains("terminal-visible")) {
            input.focus();
        }
    };

    document.getElementById("terminal-close").onclick = () => {
        terminal.classList.remove("terminal-visible");
    };


    /* ---------- MATRIX EFFECT ---------- */

    function matrixEffect() {

        const canvas = document.createElement("canvas");
        canvas.id = "matrix-canvas";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = "01JASUR<>/{}[]$#@";
        const fontSize = 15;

        let columns = Math.floor(canvas.width / fontSize);
        let drops = Array(columns).fill(1);

        const interval = setInterval(() => {

            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#00ff88";
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {

                const text = chars[Math.floor(Math.random() * chars.length)];

                ctx.fillText(
                    text,
                    i * fontSize,
                    drops[i] * fontSize
                );

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }

        }, 35);

        setTimeout(() => {
            clearInterval(interval);
            canvas.remove();
        }, 5000);
    }


    /* ---------- THEME BUTTON ---------- */

    const theme = document.createElement("button");
    theme.id = "theme-toggle";
    theme.innerHTML = "☀";
    document.body.appendChild(theme);

    let light = false;

    theme.onclick = () => {

        light = !light;

        document.body.classList.toggle("light-mode", light);

        theme.innerHTML = light ? "☾" : "☀";

        notify(light ? "Light mode activated" : "Dark mode activated");
    };


    /* ---------- TYPING EFFECT ---------- */

    const heroTitle =
        document.querySelector("h1") ||
        document.querySelector(".hero h1");

    if (heroTitle) {

        const original = heroTitle.textContent;

        heroTitle.textContent = "";

        let i = 0;

        const typing = setInterval(() => {

            heroTitle.textContent += original[i];

            i++;

            if (i >= original.length) {
                clearInterval(typing);
            }

        }, 45);
    }


    /* ---------- SCROLL REVEAL ---------- */

    const revealElements = document.querySelectorAll(
        "section, .card, .hero, header, footer"
    );

    revealElements.forEach(el => {

        el.style.opacity = "0";
        el.style.transform = "translateY(25px)";

        const observer = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.transition =
                        "opacity .7s ease, transform .7s ease";

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    observer.unobserve(entry.target);
                }

            });

        }, {
            threshold: 0.12
        });

        observer.observe(el);
    });


    /* ---------- BUTTON EFFECTS ---------- */

    document.querySelectorAll("button, a").forEach(el => {

        el.addEventListener("mouseenter", () => {
            el.style.transition = "transform .2s ease";
            el.style.transform = "translateY(-2px)";
        });

        el.addEventListener("mouseleave", () => {
            el.style.transform = "";
        });

    });


    /* ---------- DEMO LOGIN ---------- */

    const loginButtons = document.querySelectorAll(
        "button, a"
    );

    loginButtons.forEach(button => {

        const text = button.textContent.toLowerCase();

        if (text.includes("login") ||
            text.includes("войти") ||
            text.includes("sign in")) {

            button.addEventListener("click", e => {

                e.preventDefault();

                const login = prompt("Demo login:");

                if (login) {
                    notify("Welcome, " + login + "!");
                }

            });

        }

    });


    /* ---------- CONTACT FORM ---------- */

    document.querySelectorAll("form").forEach(form => {

        form.addEventListener("submit", e => {

            e.preventDefault();

            notify("Message prepared successfully.");

            form.reset();
        });

    });


    /* ---------- SYSTEM CLOCK ---------- */

    const clock = document.createElement("div");
    clock.id = "system-clock";

    document.body.appendChild(clock);

    function updateClock() {

        clock.textContent =
            "SYSTEM TIME  " +
            new Date().toLocaleTimeString();

    }

    updateClock();
    setInterval(updateClock, 1000);


    /* ---------- EASTER EGG ---------- */

    let keys = "";

    document.addEventListener("keydown", e => {

        keys += e.key.toLowerCase();

        if (keys.length > 20) {
            keys = keys.slice(-20);
        }

        if (keys.includes("jasur")) {

            notify("JASUR MODE ACTIVATED ⚡");

            matrixEffect();

            keys = "";
        }

    });

});


/* =========================
   DYNAMIC CSS
========================= */

const css = document.createElement("style");

css.textContent = `

#jasur-terminal {

    position: fixed;
    right: 25px;
    bottom: 80px;

    width: min(650px, calc(100vw - 30px));
    height: 420px;

    background: #050805;
    border: 1px solid #00ff88;

    box-shadow:
        0 0 20px rgba(0,255,136,.25),
        0 0 60px rgba(0,255,136,.1);

    color: #00ff88;

    font-family:
        Consolas,
        monospace;

    z-index: 99999;

    display: flex;
    flex-direction: column;

    opacity: 0;
    pointer-events: none;

    transform: translateY(20px) scale(.98);

    transition:
        opacity .25s ease,
        transform .25s ease;
}

#jasur-terminal.terminal-visible {

    opacity: 1;
    pointer-events: auto;

    transform:
        translateY(0)
        scale(1);
}

.terminal-head {

    height: 42px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 14px;

    background: #08120d;

    border-bottom:
        1px solid #00ff88;
}

#terminal-close {

    background: none;
    border: none;

    color: #00ff88;

    font-size: 25px;

    cursor: pointer;
}

#terminal-output {

    flex: 1;

    overflow-y: auto;

    padding: 15px;

    line-height: 1.6;

    font-size: 14px;
}

.cmd {

    color: white;
}

.terminal-input-line {

    display: flex;
    gap: 8px;

    padding: 12px;

    border-top:
        1px solid #163d29;
}

.terminal-input-line span {
    white-space: nowrap;
}

#terminal-input {

    flex: 1;

    background: transparent;

    border: none;
    outline: none;

    color: #00ff88;

    font-family: monospace;

    font-size: 14px;
}

#terminal-open {

    position: fixed;

    right: 25px;
    bottom: 20px;

    z-index: 99998;

    padding: 12px 18px;

    background: #050805;

    border:
        1px solid #00ff88;

    color: #00ff88;

    font-family: monospace;

    cursor: pointer;

    box-shadow:
        0 0 15px rgba(0,255,136,.2);
}

#theme-toggle {

    position: fixed;

    left: 20px;
    bottom: 20px;

    z-index: 99998;

    width: 45px;
    height: 45px;

    border:
        1px solid #00ff88;

    background: #050805;

    color: #00ff88;

    cursor: pointer;

    font-size: 20px;
}

.js-notification {

    position: fixed;

    top: 25px;
    right: 25px;

    z-index: 100000;

    background: #050805;

    border:
        1px solid #00ff88;

    color: #00ff88;

    padding: 13px 20px;

    font-family: monospace;

    transform:
        translateX(120%);

    transition:
        transform .35s ease;

    box-shadow:
        0 0 20px rgba(0,255,136,.2);
}

.js-notification.show {

    transform:
        translateX(0);
}

#system-clock {

    position: fixed;

    left: 20px;
    top: 20px;

    z-index: 9999;

    font-family: monospace;

    color: #00ff88;

    font-size: 11px;

    opacity: .65;
}

#matrix-canvas {

    position: fixed;

    inset: 0;

    z-index: 99990;

    pointer-events: none;

    background: black;
}

body.light-mode {

    background: #f2f2f2 !important;

    color: #111 !important;
}

body.light-mode #jasur-terminal,
body.light-mode #terminal-open,
body.light-mode #theme-toggle {

    background: white;

    color: #111;

    border-color: #111;
}

body.light-mode #terminal-input {

    color: #111;
}

@media (max-width: 600px) {

    #jasur-terminal {

        right: 10px;
        bottom: 75px;

        width: calc(100vw - 20px);
        height: 380px;
    }

    #terminal-open {

        right: 10px;
    }

    #system-clock {

        display: none;
    }
}

`;

document.head.appendChild(css);
