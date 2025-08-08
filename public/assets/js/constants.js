// constants.js

export const allowedThemes = {
    cobalt: "theme-cobalt",
    corporate: "theme-corporate",
    dark: "theme-dark",
    dracula: "theme-dracula",
    forest: "theme-forest",
    gruvbox: "theme-gruvbox",
    hacker: "theme-hacker",
    iceberg: "theme-iceberg",
    light: "theme-light",
    matrix: "theme-matrix-reloaded",
    monokai: "theme-monokai",
    nord: "theme-nord",
    pirate: "theme-pirate",
    retro: "theme-retro",
    solarized: "theme-solarized-light",
    sunset: "theme-sunset",
    tokyo: "theme-tokyo-night",
    ubuntu: "theme-ubuntu"
};

export const commandRegistry = [
    { command: "abhinav", description: "Visit the portfolio website" },
    { command: "about", description: "Get to know me better" },
    { command: "ascii", description: "Convert text to ASCII art", args: "<text>" },
    { command: "clear", description: "Clear terminal screen/history/all", args: "<args>",
      autocomplete: ["screen", "history", "all"]
    },
    { command: "contact", description: "View contact information" },
    { command: "date", description: "Display the current date" },
    { command: "help", description: "List all available commands" },
    { command: "history", description: "Show previously entered commands" },
    { command: "projects", description: "Show a list of major projects" },
    { command: "quote", description: "Show a random inspirational quote" },
    { command: "reset", description: "Reset the terminal to default state" },
    { command: "set theme", description: "Change the terminal theme", args: "<theme>",
        autocomplete: [
            "cobalt", "corporate", "dark", "dracula", "forest", "gruvbox",
            "hacker", "iceberg", "light", "matrix", "monokai", "nord",
            "pirate", "retro", "solarized", "sunset", "tokyo", "ubuntu"
        ]
    },
    { command: "set username", description: "Set a new terminal username", args: "<name>" },
    { command: "social", description: "View social media profiles" },
    { command: "theme", description: "Display a list of available themes" },
    { command: "time", description: "Displays the current time" },
    { command: "username", description: "Display the current username" }
];

export const CONFIG = {
    siteURL: "https://iabhinav.me",
    email: "hello@iabhinav.me",
    phone: "+91 97090 83123",
    social: {
        linkedin: "https://www.linkedin.com/in/JAbhinav11",
        instagram: "https://www.instagram.com/JAbhinav11",
        facebook: "https://www.facebook.com/JAbhinav11",
        twitter: "https://x.com/JAbhinav11",
        github: "https://github.com/JAbhinav11"
    }
};

export function helpMessage() {
    return `<span class="response-title">⚠️ The terminal is currently being updated — some features may be temporarily unavailable.</span>` +
       `<span class="response-title">You can still use the following commands:</span>` +
       `abhinav           - Open my portfolio website<br>` +
       `about             - Display information about me<br>` +
       `ascii [text]      - Convert text to ASCII art<br>` +
       `                     Use 'ascii your_name' to change to ASCII art<br>` +
       `projects          - List some of my major projects<br>` +
       `contact           - Show my contact information<br>` +
       `social            - Display my social media profiles<br>` +
       `quote             - Show a random inspirational quote<br>` +
       `history           - Show previously entered commands<br>` +
       `clear             - Clear the terminal screen or command history<br>` +
       `                     Options: [screen|history|all], Default: screen<br>` +
       `reset             - Reset the terminal to its default state<br>` +
       `username          - Display the current username<br>` +
       `                     Use 'set username your_name' to change it<br>` +
       `theme             - List all available themes<br>` +
       `                     Use 'set theme theme_name' to apply a theme<br>` +
       `help              - Show this help message`
}


export function aboutOutput() {
    return `<span class="response-title">About Me:</span>` +
        `Hi! I'm Abhinav, a Software Engineer at Amazon based in Bangalore, India.<br>` +
        `I specialize in building scalable web and cloud-based systems.<br>` +
        `Graduated from NIT Trichy.<br><br>` +
        `Type 'projects' to view my work.`;
}

export function contactOutput() {
    return `<span class="response-title">Contact Details:</span>` +
        `Website           - <a href="${CONFIG.siteURL}" target="_blank">${CONFIG.siteURL}</a><br>` +
        `Email             - <a href="mailto:${CONFIG.email}" style="color:inherit;" class="contact-text">${CONFIG.email}</a><br>` +
        `Mobile            - <a href="tel:${CONFIG.phone.replace(/\s+/g, '')}" style="color:inherit;" class="contact-text">${CONFIG.phone}</a>`;
}

export function projectsOutput() {
    return `<span class="response-title">Projects:</span>` +
        `Personal Website   - <a href="https://iabhinav.me" target="_blank">https://iabhinav.me</a><br>` +
        `Portfolio Terminal - <a href="https://terminal.iabhinav.me" target="_blank">https://terminal.iabhinav.me</a><br>` +
        `GitHub Repos       - <a href="${CONFIG.social.github}" target="_blank">${CONFIG.social.github}</a>`;
}

export function socialOutput() {
    return `<span class="response-title">Social Media:</span>` +
        `Website           - <a href="${CONFIG.siteURL}" target="_blank">${CONFIG.siteURL}</a><br>` +
        `LinkedIn          - <a href="${CONFIG.social.linkedin}" target="_blank">${CONFIG.social.linkedin}</a><br>` +
        `Instagram         - <a href="${CONFIG.social.instagram}" target="_blank">${CONFIG.social.instagram}</a><br>` +
        `Facebook          - <a href="${CONFIG.social.facebook}" target="_blank">${CONFIG.social.facebook}</a><br>` +
        `Twitter           - <a href="${CONFIG.social.twitter}" target="_blank">${CONFIG.social.twitter}</a><br>` +
        `GitHub            - <a href="${CONFIG.social.github}" target="_blank">${CONFIG.social.github}</a><br><br>` +
        `<span class="response-title">Type 'social &lt;platform&gt;' to go to the social media.</span>`;
}

export const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1ZM0 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1ZM21 11a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM13 21a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2ZM6.343 17.657a1 1 0 0 1 0 1.414L4.93 20.485a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0ZM20.485 3.515a1 1 0 0 1 0 1.414l-1.414 1.414a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0ZM3.515 3.515a1 1 0 0 1 1.414 0l1.414 1.414A1 1 0 1 1 4.93 6.343L3.515 4.93a1 1 0 0 1 0-1.414ZM17.657 17.657a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 1 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 0-1.414ZM5 12a7 7 0 1 1 14 0 7 7 0 0 1-14 0Z"/>
</svg>`;

export const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
<path d="M9.272 2.406a1 1 0 0 0-1.23-1.355C6.59 1.535 5.432 2.487 4.37 3.55a11.399 11.399 0 0 0 0 16.182c4.518 4.519 11.51 4.261 15.976-.205 1.062-1.062 2.014-2.22 2.498-3.673A1 1 0 0 0 21.55 14.6c-3.59 1.322-7.675.734-10.434-2.025-2.765-2.766-3.328-6.83-1.844-10.168Z"/>
</svg>`;
