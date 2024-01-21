// extension.ts
const vscode = require('vscode');
const quotes = require('./quotes'); // Adjust the path as needed

function activate(context) {
	// Register the productive-focus.startFocus command
	context.subscriptions.push(vscode.commands.registerCommand('productive-focus.startFocus', async () => {
		const enteredUsername = await vscode.window.showInputBox({ prompt: 'Enter your username' });

		if (enteredUsername) {
			const enteredInterval = await vscode.window.showInputBox({ prompt: 'Enter focus interval in minutes' });

			if (enteredInterval) {
				startFocus(enteredUsername, parseInt(enteredInterval));
			} else {
				vscode.window.showErrorMessage('Focus interval not provided. Extension will not start.');
			}
		} else {
			vscode.window.showErrorMessage('Username not provided. Extension will not start.');
		}
	}));

	// Register the extendFocus command
	context.subscriptions.push(vscode.commands.registerCommand('productive-focus.extendFocus', () => {
		vscode.window.showInformationMessage('Focus interval extended successfully!');
		// Continue the focus timer with the extended interval
		clearInterval(focusTimer);
		startFocus(username, extendedInterval);
	}));

	// Register the closeFocus command
	context.subscriptions.push(vscode.commands.registerCommand('productive-focus.closeFocus', () => {
		vscode.window.showInformationMessage('Focus interval closed. Extension deactivated.');
		// Deactivate the extension
		clearInterval(focusTimer);
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	}));
}

let focusTimer;
let username;
let remainingTime;
let extendedInterval;

function startFocus(inputUsername, interval) {
	username = inputUsername;
	remainingTime = interval * 60; // Convert minutes to seconds
	extendedInterval = interval; // Store the original interval
	const hourglassIcon = ['\u231B', '\u23F3']; // Unicode characters for hourglasses
	let currentIconIndex = 0;
	let hasEndedMessageDisplayed = false;

	function updateStatusBar() {
		const minutes = Math.floor(remainingTime / 60);
		const seconds = remainingTime % 60;
		const timeDisplay = `Focus Timer:  ${minutes}m ${seconds}s `;
		vscode.window.setStatusBarMessage(`${hourglassIcon[currentIconIndex]} ${timeDisplay}`);
		currentIconIndex = (currentIconIndex + 1) % 2;
	}

	// Initial status bar update
	updateStatusBar();

	// Set interval to update status bar every second
	focusTimer = setInterval(() => {
		remainingTime--;
		if (remainingTime >= 0) {
			// Update status bar with remaining time
			updateStatusBar();

			// Display quote every 7 minutes
			if (remainingTime % (7 * 60) === 0) {
				const randomQuote = getRandomQuote(quotes);
				vscode.window.showInformationMessage(`${username}, ${randomQuote}`);
			}
		} else if (!hasEndedMessageDisplayed) {
			// Display prompt to extend or close the interval
			vscode.window.showInformationMessage('Focus interval ended. Would you like to extend or close the interval?', 'Extend', 'Close')
				.then((choice) => {
					if (choice === 'Extend') {
						// Extend the focus interval
						vscode.commands.executeCommand('productive-focus.extendFocus');
					} else if (choice == 'Close') {
						// Close the focus interval
						vscode.commands.executeCommand('productive-focus.closeFocus');
					}
				});
			hasEndedMessageDisplayed = true;
		}
	}, 1000);
}

function getRandomQuote(quotes) {
	const randomIndex = Math.floor(Math.random() * quotes.length);
	return quotes[randomIndex];
}

exports.activate = activate;
