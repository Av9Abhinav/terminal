// Minifier: https://www.cleancss.com/javascript-minify/

import * as Constants from './constants.js';

"use strict";

let username = localStorage.getItem("terminal-username") || "visitor";
let terminalOutput;
let mainContainer;
let pendingAction = null;
const commandHistory = [];
let historyIndex = -1;
const maxHistory = 100;
let lastSuggestionElement = null;

const commandHandlers = {
    help: () => printToTerminal(Constants.helpMessage()),
    abhinav: () => window.open(Constants.CONFIG.siteURL, "_blank"),
    about: () => printToTerminal(Constants.aboutOutput()),
    contact: () => printToTerminal(Constants.contactOutput()),
    projects: () => printToTerminal(Constants.projectsOutput()),
    social: handleSocialCommand,
    set: handleSetCommand,
    date: () => printToTerminal(new Date().toDateString()),
    time: () => printToTerminal(new Date().toLocaleTimeString()),
    reset: handleResetCommand,
    username: () => printToTerminal(username),
    theme: () => printToTerminal(Object.keys(Constants.allowedThemes).join('\n')),
    history: handleHistoryCommand,
    ascii: handleAsciiCommand,
    quote: handleQuoteCommand,
    clear: handleClearCommand,
    '': () => {}  // Empty command — do nothing
};

function scrollToBottom() {
    requestAnimationFrame(() => {
        mainContainer.scrollTop = mainContainer.scrollHeight;
    });
}

function getPromptString() {
    if (pendingAction) return `[confirm]: `;
    return `${username}@iabhinav.me:~$ `;
}

function switchTheme(themeName) {
    const body = document.body;
    body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    body.className = themeName;
    updateToggleIcon(themeName);
}

function clearTerminal() {
    terminalOutput.innerHTML = '';
    const hintLine = document.createElement("div");
    hintLine.innerHTML = `<span>Type <span class="prompt">'help'</span> to view a list of available commands.</span><br><br>`;
    terminalOutput.insertBefore(hintLine, terminalOutput.firstChild);
}

function printToTerminal(text) {
    const outputDiv = document.createElement("div");
    outputDiv.className = "terminal-output-line";
    outputDiv.innerHTML = `<pre>${text}</pre>`;
    terminalOutput.appendChild(outputDiv);
    scrollToBottom();
}

function handleCommand(cmd) {
    const normalizedCmd = cmd.toLowerCase();

    if (pendingAction) {
        const response = normalizedCmd.trim();
        if (["y", "yes"].includes(response.toLowerCase())) {
            const result = pendingAction();
            pendingAction = null;
            return result instanceof Promise ? result : Promise.resolve();
        } else {
            printToTerminal("Cancelled the action.");
            pendingAction = null;
            return Promise.resolve();
        }
    }

    if (cmd !== "") {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
        while (commandHistory.length > maxHistory) commandHistory.shift();
        localStorage.setItem("terminal-history", JSON.stringify(commandHistory));
    }

    const [mainCommand, ...args] = cmd.trim().split(/\s+/);
    const handler = commandHandlers[mainCommand.toLowerCase()];

    if (handler) {
        const result = handler(args);
        return result instanceof Promise ? result : Promise.resolve();
    }

    printToTerminal(`Command not found: ${cmd}`);
    return Promise.resolve();
}

function handleInputKeyDown(e) {
    const input = e.target;
    if (e.key === "Enter") {
        e.preventDefault();
        clearLastSuggestion();
        const cmd = input.innerText.trim();

        // Remove input and make it static text
        input.contentEditable = "false";
        input.removeEventListener("keydown", handleInputKeyDown);

        // Handle command output
        const result = handleCommand(cmd);

        Promise.resolve(result).then((outputText) => {
            if (outputText !== null && outputText !== undefined) {
                const outputDiv = document.createElement("div");
                outputDiv.className = "terminal-output-line";
                outputDiv.innerText = `${outputText}`;
                terminalOutput.appendChild(outputDiv);
            }

            // Create a new input line only after async command finishes
            terminalOutput.appendChild(createInputLine());
            scrollToBottom();
        });

    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        clearLastSuggestion();
        if (commandHistory.length > 0 && historyIndex > 0) {
            historyIndex--;
            input.innerText = commandHistory[historyIndex];
            moveCursorToEnd(input);
        }

    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        clearLastSuggestion();
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.innerText = commandHistory[historyIndex];
            moveCursorToEnd(input);
        } else {
            historyIndex = commandHistory.length;
            input.innerText = "";
        }

    } else if (e.key === "Tab") {
          e.preventDefault();
          const currentInput = input.innerText.trim().toLowerCase();

          clearLastSuggestion();

          // 1. Find matching full commands
          const matchingCommand = Constants.commandRegistry.find(cmd =>
              currentInput.startsWith(cmd.command)
          );

          if (matchingCommand && matchingCommand.autocomplete) {
              // It's a command with autocomplete values

              const typedArg = currentInput.slice(matchingCommand.command.length).trim();

              const matchedOptions = matchingCommand.autocomplete.filter(opt =>
                  opt.startsWith(typedArg)
              );

              if (matchedOptions.length === 1) {
                  // Auto-complete directly
                  input.innerText = `${matchingCommand.command} ${matchedOptions[0]}`;
                  moveCursorToEnd(input);
              } else if (matchedOptions.length > 1) {
                  // Show suggestion list
                  const suggestionDiv = document.createElement("div");
                  suggestionDiv.className = "terminal-output-line suggestion-output";
                  const suggestionText = [
                      "Suggestions:\n",
                      ...matchedOptions.map(opt =>
                          `${matchingCommand.command} ${opt}`
                      )
                  ].join("\n");
                  suggestionDiv.innerText = suggestionText;
                  terminalOutput.appendChild(suggestionDiv);
                  lastSuggestionElement = suggestionDiv;
                  scrollToBottom();
              }

          } else {
              // It's a top-level command name being typed

              const matches = Constants.commandRegistry.filter(c =>
                  c.command.startsWith(currentInput)
              );

              if (matches.length === 1) {
                  // Autocomplete to full command
                  input.innerText = matches[0].command;
                  moveCursorToEnd(input);
              } else if (matches.length > 1) {
                  // Show list of matching commands
                  const suggestionDiv = document.createElement("div");
                  suggestionDiv.className = "terminal-output-line suggestion-output";

                  const suggestionText = [
                      "Suggestions:\n",
                      ...matches.map(cmd =>
                          `${(cmd.command + " " + (cmd.args || "")).padEnd(30)} - ${cmd.description}`
                      )
                  ].join("\n");

                  suggestionDiv.innerText = suggestionText;
                  terminalOutput.appendChild(suggestionDiv);
                  lastSuggestionElement = suggestionDiv;
                  scrollToBottom();
              }
          }
      } else if (e.key === "Backspace" || e.key === "Escape") {
        // Handle backspace to remove last suggestion
        clearLastSuggestion();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        clearTerminal();
        terminalOutput.appendChild(createInputLine());
        scrollToBottom();
    }

}

function handleInputEvent(e) {
    const input = e.target;
    const currentInput = input.innerText.trim().toLowerCase();

    clearLastSuggestion();
    renderSuggestions(currentInput);
    scrollToBottom();
}

function renderSuggestions(input) {
    const lowerInput = input.trim().toLowerCase();

    // Remove previous suggestions
    clearLastSuggestion();

    const suggestionDiv = document.createElement("div");
    suggestionDiv.className = "terminal-output-line suggestion-output";

    const suggestions = [];

    // Try exact or partial command match
    const matchingCommand = Constants.commandRegistry.find(cmd =>
        lowerInput.startsWith(cmd.command)
    );

    if (matchingCommand && matchingCommand.autocomplete) {
        const typedPart = lowerInput.replace(matchingCommand.command, "").trim();

        const filtered = matchingCommand.autocomplete.filter(opt =>
            opt.startsWith(typedPart)
        );

        const finalSuggestions = filtered.length > 0 || typedPart === ""
            ? filtered
            : [];

        if (finalSuggestions.length > 0) {
            suggestions.push("Suggestions:\n");
            suggestions.push(...finalSuggestions.map(opt =>
                `${matchingCommand.command} ${opt}`
            ));
        }

    } else {
        // No autocomplete command matched — show all partial command suggestions
        const filteredCommands = Constants.commandRegistry.filter(cmd =>
            cmd.command.startsWith(lowerInput)
        );

        if (filteredCommands.length > 0) {
            suggestions.push("Suggestions:\n");
            suggestions.push(...filteredCommands.map(cmd =>
                `${(cmd.command + " " + (cmd.args || "")).padEnd(30)} - ${cmd.description}`
            ));
        }
    }

    if (suggestions.length > 0) {
        suggestionDiv.innerText = suggestions.join("\n");
        terminalOutput.appendChild(suggestionDiv);
        lastSuggestionElement = suggestionDiv;
        scrollToBottom();
    }
}

function moveCursorToEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function createInputLine() {
    const wrapper = document.createElement("div");
    wrapper.className = "command-line";

    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = getPromptString();

    const input = document.createElement("span");
    input.className = "user-input";
    input.contentEditable = "true";
    input.spellcheck = false;

    input.addEventListener("keydown", handleInputKeyDown);
    input.addEventListener("input", handleInputEvent);

    wrapper.appendChild(prompt);
    wrapper.appendChild(input);
    terminalOutput.appendChild(wrapper);

    // Focus new input
    setTimeout(() => input.focus(), 0);
    return wrapper;
}

document.addEventListener("DOMContentLoaded", () => {
    mainContainer = document.querySelector("main");
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    let localTheme = localStorage.getItem("terminal-theme");
    if (localTheme && !document.body.classList.contains(localTheme)) {
        switchTheme(localTheme);
        updateToggleIcon(localTheme);
    } else {
        switchTheme(getSystemTheme());
        updateToggleIcon(getSystemTheme());
    }

    terminalOutput = document.querySelector(".command-terminal");

    // Load saved command history
    const savedHistory = JSON.parse(localStorage.getItem("terminal-history") || "[]");
    commandHistory.push(...savedHistory);
    historyIndex = commandHistory.length;

    // Initial prompt
    createInputLine();
    scrollToBottom();
});

const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'theme-dark'
        : 'theme-light';
};

document.addEventListener("click", () => {
    const inputs = document.querySelectorAll(".user-input[contenteditable='true']");
    if (inputs.length > 0) {
        const lastInput = inputs[inputs.length - 1];
        lastInput.focus();
        const range = document.createRange();
        range.selectNodeContents(lastInput);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

function handleSetCommand(args) {
  const [key, ...values] = args;

  if (args.length < 2) {
    printToTerminal(
              `<span class="response-title">Unknown setting: '${key}'</span>\n` +
              `<span class="response-title">Valid options:</span> - username\n - theme\n\n` +
              `<span class="response-title">Usage:</span> - set username &lt;name&gt;\n - set theme &lt;theme&gt;`
          );
    return;
  }
  switch (key.toLowerCase()) {
    case "username": {
        if (values.length != 1) {
            printToTerminal("Error: INVALID_USERNAME " + `'${values.join(" ").trim()}'` +
             "\nUsername can only contain letters, numbers, and underscores.");
            return;
        }

        const user = values[0].trim();

        if (!user) {
            printToTerminal("Error: USERNAME_NOT_UPDATED \nUsage: set username [your_name]");
            return;
        }
        if (/[^a-zA-Z0-9_]/.test(user)) {
            printToTerminal("Error: INVALID_USERNAME " + `'${user}'` +
             "\nUsername can only contain letters, numbers, and underscores.");
            return;
        }
        if (user.length < 3 || user.length > 20) {
            printToTerminal("Error: USERNAME_LENGTH_INVALID \nUsername must be between 3 and 20 characters.");
            return;
        }
        if (user === username) {
            printToTerminal("Username is already set to " + `'${user}'` + "\nUse 'set username [new_name]' to change it.");
            return;
        }
        // Update username
        username = user;
        localStorage.setItem("terminal-username", username);
        printToTerminal(`Username updated to '${user}'`);
      break;
    }

    case "theme": {
        if (values.length != 1) {
            printToTerminal(
                    `<span class="response-title">Error: INVALID_THEME</span> ${values.join(" ").trim()}` +
                    `<span class="response-title">Type 'theme' to view list of available themes.</span>`
                );
            return;
        }
        const key = values[0].trim().toLowerCase();
        const theme = Constants.allowedThemes[key];
        if (!theme) {
            printToTerminal(
                `<span class="response-title">Error: INVALID_THEME '${key}'</span>` +
                `<span class="response-title">Available themes:</span>` +
                Object.keys(Constants.allowedThemes).map(t => `- ${t}`).join('<br>')
            );
            return;
        }
        switchTheme(theme);
        localStorage.setItem("terminal-theme", theme);
        printToTerminal(`Theme changed to '${key}'`);
      break;
    }
    default:
      printToTerminal(
                  `<span class="response-title">Unknown setting: '${key}'</span>\n` +
                  `<span class="response-title">Valid options:</span> - username\n - theme\n\n` +
                  `<span class="response-title">Usage:</span> - set username &lt;name&gt;\n - set theme &lt;theme&gt;`
              );
  }
}

function handleSocialCommand(args) {
  if (args.length === 0) {
    printToTerminal(Constants.socialOutput());
    return;
  }

  const platform = args[0].toLowerCase();
  const url = Constants.CONFIG.social?.[platform];

  if (url) {
    printToTerminal(`Opening ${platform} ...`);
    window.open(url, "_blank");
  } else {
    printToTerminal(`Unknown social platform: ${platform}`);
  }
}

function handleResetCommand(args) {
    const scope = args[0]?.toLowerCase() || "all";

    if (scope === "all") {
        printToTerminal("Are you sure you want to reset all terminal settings? Type 'yes' or 'no'.");
        pendingAction = () => {
            localStorage.clear();
            username = "visitor";
            switchTheme(getSystemTheme());
            printToTerminal("All terminal settings reset to default.");
        };
    } else {
        printToTerminal(
                    `<span class="response-title">Unknown reset target: '${scope}'</span>\n` +
                    `<span class="response-title">Valid option:</span> - all\n\n` +
                    `<span class="response-title">Usage:</span> reset all`
                );
    }
}

function handleClearCommand(args) {
    const scope = args[0]?.toLowerCase() || "screen";

    switch (scope) {
        case "history":
            localStorage.removeItem("terminal-history");
            commandHistory.length = 0;
            historyIndex = 0;
            printToTerminal("Command history cleared.");
            break;

        case "screen":
            clearTerminal();
            break;

        case "all":
            localStorage.removeItem("terminal-history");
            commandHistory.length = 0;
            historyIndex = 0;
            clearTerminal();
            printToTerminal("Terminal history and screen cleared.");
            break;

        default:
            printToTerminal(
                        `<span class="response-title">Unknown clear target: '${scope}'</span>\n` +
                        `<span class="response-title">Valid options:</span> - history\n - screen\n - all\n\n` +
                        `<span class="response-title">Usage:</span> clear [history|screen|all]`
                    );
            break;
    }
}

function handleHistoryCommand(args) {
    const effectiveHistory = commandHistory.slice(0, -1);

    if (effectiveHistory.length === 0) {
        printToTerminal("No command history available.");
        return;
    }

    let count = effectiveHistory.length;
    if (args.length === 1 && !isNaN(parseInt(args[0]))) {
        count = Math.min(parseInt(args[0]), effectiveHistory.length);
    }

    const historyOutput = effectiveHistory
        .slice(-count)
        .map((cmd, idx) => `${idx + 1}: ${cmd}`)
        .join("\n");

    printToTerminal(historyOutput);
}


function clearLastSuggestion() {
    if (lastSuggestionElement) {
        if (terminalOutput.contains(lastSuggestionElement)) {
            terminalOutput.removeChild(lastSuggestionElement);
        } else {
            lastSuggestionElement.remove();
        }
        lastSuggestionElement = null;
    }
}

const fullScreenToggleBtn = document.querySelector('.fullscreen-toggle');

function updateFullscreenIcon() {
    const isFullscreen = !!document.fullscreenElement;
    const icon = isFullscreen ? 'restore.svg' : 'expand.svg';
    fullScreenToggleBtn.style.maskImage = `url('/assets/images/svg/${icon}')`;
    fullScreenToggleBtn.style.webkitMaskImage = `url('/assets/images/svg/${icon}')`;
}

fullScreenToggleBtn.addEventListener('click', () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
});

// Listen for changes in fullscreen state
document.addEventListener('fullscreenchange', updateFullscreenIcon);

// ======= Theme Toggle Button =======
const themeToggle = document.getElementById("theme-toggle");

function updateToggleIcon(currentTheme) {
    themeToggle.innerHTML = currentTheme === 'theme-dark' ? Constants.sunIcon : Constants.moonIcon;
}

themeToggle.addEventListener("click", () => {
    const currentTheme = localStorage.getItem("terminal-theme") || "theme-dark";
    const newTheme = currentTheme === "theme-dark" ? "theme-light" : "theme-dark";
    document.body.classList.remove(currentTheme);
    document.body.classList.add(newTheme);
    localStorage.setItem("terminal-theme", newTheme);
    updateToggleIcon(newTheme);
});

function handleAsciiCommand(args) {
    const text = args.join(" ");
    if (!text) {
        printToTerminal("Usage: ascii <text>");
        return Promise.resolve();
    }
    figlet.defaults({ fontPath: "/assets/fonts/" });
    return new Promise((resolve) => {
        figlet.text(text, {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        }, (err, data) => {
            if (err) {
                printToTerminal("Error generating ASCII art.");
                return resolve();
            }
            const styledAscii = data
                .split('\n')
                .map(line => `<span class="ascii-colored">${line}</span>`)
                .join('\n');

            printToTerminal(`<pre>${styledAscii}</pre>`);
            resolve();
        });
    });
}

function handleQuoteCommand() {
    const apiURL = "/api/quote";

    return fetch(apiURL)
        .then(response => {
            if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }
            return response.json();
        })
        .then(data => {
            if (typeof data?.quote === "string" && data.quote.trim() !== "") {
                printToTerminal(
                  `<span class="response-title">💬 Quote of the Moment:</span><br>${data.quote}`
                );
            } else {
                printToTerminal("🤷 There is no quote at the moment. Please try again later.");
            }
        })
        .catch(error => {
            printToTerminal("⚠️ There is no quote at the moment. Please try again later.");
        });
}



