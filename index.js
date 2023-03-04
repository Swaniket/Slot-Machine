/*
    1. Deposit some money
    2. Determine the number of lines to bet on
    3. Collect the bet amount
    4. Spin the slot machine
    5. Check if the user won
    6. Give user their winnings
    7. Play again
    8. Handle case when the user has no money left.
*/

const prompt = require("prompt-sync")();

const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
  A: 2,
  B: 4,
  C: 6,
  D: 8,
};

const SYMBOL_VALUES = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
};

// ---- Input Validators ----
const depositValidator = (depositAmount) => {
  return isNaN(depositAmount) || depositAmount <= 0;
};

const numberOfLinesValidator = (numberOfLines) => {
  return isNaN(numberOfLines) || numberOfLines < 1 || numberOfLines > 3;
};

const betValidator = (bet, [balance, lines]) => {
  return isNaN(bet) || bet <= 0 || bet > balance / lines;
};

// ---- Dynamic function to get user input ----
const getUserInput = (
  promptMessage,
  invalidInputMessage,
  validator,
  isBet = false,
  ...rest
) => {
  while (true) {
    const userInput = parseFloat(prompt(promptMessage));

    if (isBet ? validator(userInput, rest) : validator(userInput)) {
      console.log(invalidInputMessage);
    } else {
      return userInput;
    }
  }
};

// Spin the Slot Machine
const spin = () => {
  const symbols = [];
  const reels = []; // Each sub array indicates a whole column in the slot machine

  // Generate the symbols array
  for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
    for (let i = 0; i < count; i++) {
      symbols.push(symbol);
    }
  }

  // Populating the reels array with symbols array
  for (let i = 0; i < COLS; i++) {
    reels.push([]);
    const reelSymbols = [...symbols];
    for (let j = 0; j < ROWS; j++) {
      const randomIndex = Math.floor(Math.random() * reelSymbols.length);
      const selectedSymbol = reelSymbols[randomIndex];
      reels[i].push(selectedSymbol);
      // Remove the selected symbol for the reel
      reelSymbols.splice(randomIndex, 1);
    }
  }

  return reels;
};

// Get the transpose of the reels to generate the slot machine board
const transposeReels = (reels) => {
  const rows = [];

  for (let i = 0; i < ROWS; i++) {
    rows.push([]);
    for (let j = 0; j < COLS; j++) {
      rows[i].push(reels[j][i]);
    }
  }

  return rows;
};

// Print the slot machine
const printSlotMachine = (rows) => {
  for (const row of rows) {
    let rowString = "";
    for (const [i, symbol] of row.entries()) {
      rowString += symbol;
      // Determine if we need to add |
      if (i !== row.length - 1) {
        rowString += " | ";
      }
    }
    console.log(rowString);
  }
};

// Determine if the user won
const getWinnings = (rows, bet, lines) => {
  let winnings = 0;

  // We only look at rows equal to the number of lines
  for (let row = 0; row < lines; row++) {
    const symbols = rows[row];
    let allSame = true;

    // Determine if all the symbols in the same row are the same
    for (const symbol of symbols) {
      if (symbol !== symbols[0]) {
        allSame = false;
        break;
      }
    }

    // Winnings = bet * multiplier
    if (allSame) {
      winnings += bet * SYMBOL_VALUES[symbols[0]];
    }
  }
  return winnings;
};

const playGame = () => {
  let balance = getUserInput(
    "Enter a deposit amount: ",
    "Invalid deposit amount, try again.",
    depositValidator
  );

  while (true) {
    console.log(`You have a balance of $${balance}`);
    const numberOfLines = getUserInput(
      "Enter the number of lines to bet on (1-3): ",
      "Invalid number of lines, try again.",
      numberOfLinesValidator
    );

    const betAmount = getUserInput(
      "Enter the bet per line: ",
      "Invalid bet, try again.",
      betValidator,
      true,
      balance,
      numberOfLines
    );

    balance -= betAmount * numberOfLines;

    const reels = spin();
    const rows = transposeReels(reels);

    printSlotMachine(rows);

    const winnings = getWinnings(rows, betAmount, numberOfLines);
    balance += winnings;

    console.log(`You won $${winnings}`);

    if (balance <= 0) {
      console.log("You ran out of money!");
      break;
    }

    const playAgain = prompt("Do you want to play again (y/n)?");
    if (playAgain !== "y") break;
  }
};

playGame();
