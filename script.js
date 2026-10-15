
const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");
const keypad = document.getElementById("keypad");

let currentValue = "0";
let previousValue = null;
let currentOperator = null;
let waitingForNextValue = false;
let hasError = false;

const operatorSymbols = {
    "+": "+",
    "−": "−",
    "×": "×",
    "÷": "÷"
};

// Convert numeric values into a readable format.
function formatNumber(value) {
    if (!Number.isFinite(value)) {
        return "Error";
    }

    const rounded = Number(value.toPrecision(12));

    if (Math.abs(rounded) >= 1e12 ||
        (rounded !== 0 && Math.abs(rounded) < 1e-8)) {
        return rounded.toExponential(5);
    }

    return String(rounded);
}

// Update the calculator screen.
function updateDisplay() {
    resultDisplay.textContent = currentValue;

    if (currentOperator !== null && previousValue !== null) {
        expressionDisplay.textContent =
            `${formatNumber(previousValue)} ${operatorSymbols[currentOperator]}`;
    } else {
        expressionDisplay.textContent = "Ready for input";
    }
}

// Reset the calculator completely.
function clearCalculator() {
    currentValue = "0";
    previousValue = null;
    currentOperator = null;
    waitingForNextValue = false;
    hasError = false;

    updateDisplay();
}

// Add a number to the current input.
function inputNumber(number) {
    if (hasError) {
        clearCalculator();
    }

    if (waitingForNextValue) {
        currentValue = number;
        waitingForNextValue = false;
    } else if (currentValue === "0") {
        currentValue = number;
    } else if (currentValue === "-0") {
        currentValue = "-" + number;
    } else {
        currentValue += number;
    }

    updateDisplay();
}

// Add a decimal point.
function inputDecimal() {
    if (hasError) {
        clearCalculator();
    }

    if (waitingForNextValue) {
        currentValue = "0.";
        waitingForNextValue = false;
    } else if (!currentValue.includes(".")) {
        currentValue += ".";
    }

    updateDisplay();
}

// Perform the selected mathematical operation.
function calculate(first, second, operator) {
    switch (operator) {
        case "+":
            return first + second;

        case "−":
            return first - second;

        case "×":
            return first * second;

        case "÷":
            if (second === 0) {
                return null;
            }
            return first / second;

        default:
            return second;
    }
}

// Handle +, -, × and ÷ buttons.
function chooseOperator(operator) {
    if (hasError) {
        return;
    }

    const inputValue = Number(currentValue);

    if (currentOperator !== null &&
        previousValue !== null &&
        !waitingForNextValue) {

        const result = calculate(
            previousValue,
            inputValue,
            currentOperator
        );

        if (result === null || !Number.isFinite(result)) {
            showError();
            return;
        }

        currentValue = formatNumber(result);
        previousValue = result;
    } else if (previousValue === null ||
               currentOperator === null) {
        previousValue = inputValue;
    }

    currentOperator = operator;
    waitingForNextValue = true;

    updateDisplay();
}

// Display a calculation result.
function calculateResult() {
    if (hasError || currentOperator === null ||
        previousValue === null || waitingForNextValue) {
        return;
    }

    const first = previousValue;
    const second = Number(currentValue);
    const operator = currentOperator;

    const result = calculate(first, second, operator);

    if (result === null || !Number.isFinite(result)) {
        showError();
        return;
    }

    expressionDisplay.textContent =
        `${formatNumber(first)} ${operatorSymbols[operator]} ${formatNumber(second)} =`;

    currentValue = formatNumber(result);
    previousValue = null;
    currentOperator = null;
    waitingForNextValue = true;

    resultDisplay.textContent = currentValue;
}

// Change positive to negative or negative to positive.
function toggleSign() {
    if (hasError) {
        return;
    }

    if (currentValue !== "0") {
        currentValue = currentValue.startsWith("-")
            ? currentValue.slice(1)
            : "-" + currentValue;
    }

    updateDisplay();
}

// Convert the current value into a percentage.
function calculatePercentage() {
    if (hasError) {
        return;
    }

    currentValue = formatNumber(Number(currentValue) / 100);
    waitingForNextValue = false;

    updateDisplay();
}

// Delete the last entered character.
function deleteLastDigit() {
    if (hasError) {
        clearCalculator();
        return;
    }

    if (waitingForNextValue) {
        return;
    }

    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);

        if (currentValue === "-") {
            currentValue = "0";
        }
    } else {
        currentValue = "0";
    }

    updateDisplay();
}

// Handle invalid operations such as division by zero.
function showError() {
    currentValue = "Error";
    previousValue = null;
    currentOperator = null;
    waitingForNextValue = true;
    hasError = true;

    resultDisplay.textContent = "Error";
    expressionDisplay.textContent = "Cannot divide by zero";
}

// Handle mouse clicks and touch interactions.
keypad.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    switch (button.dataset.action) {
        case "clear":
            clearCalculator();
            break;

        case "decimal":
            inputDecimal();
            break;

        case "sign":
            toggleSign();
            break;

        case "percent":
            calculatePercentage();
            break;

        case "delete":
            deleteLastDigit();
            break;

        case "equals":
            calculateResult();
            break;
    }
});

// Support keyboard input.
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputNumber(key);
    } else if (key === ".") {
        inputDecimal();
    } else if (key === "+") {
        chooseOperator("+");
    } else if (key === "-") {
        chooseOperator("−");
    } else if (key === "*") {
        chooseOperator("×");
    } else if (key === "/") {
        event.preventDefault();
        chooseOperator("÷");
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
    } else if (key === "Escape") {
        clearCalculator();
    } else if (key === "Backspace") {
        deleteLastDigit();
    } else if (key === "%") {
        calculatePercentage();
    }
});

// Initialize the calculator.
updateDisplay();
