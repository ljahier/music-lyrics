// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('./config.json');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

// vscode get music from command palette
// axios get music infos from api
// cheerio get music page to scrap lyrics
// open new page on vscode with lyrics

async function searchMusic(userInput) {
	const userMusic = userInput.replace(/\ /g, '%20').toLowerCase();
	const queryResult = await axios.get(`https://api.genius.com/search?q=${userMusic}`, {
		headers: {
			"Authorization": `Bearer ${config.CLIENT_ACCESS_TOKEN}`
		}
	});
	const musics = queryResult.data.response.hits;
	const listOfMusics = musics.map((elem) => ({ ...elem.result, label: elem.result.full_title }));
	const chosenMusic = await vscode.window.showQuickPick(listOfMusics);

	console.log(chosenMusic)
	return chosenMusic;
}

async function getLyrics(music) {
	const pageHtml = (await axios.get(music.url)).data;
	const $ = cheerio.load(pageHtml);
	const lyrics = $('.lyrics').contents().text()
	const doc = await vscode.workspace.openTextDocument({ "content": lyrics})
	await vscode.window.showTextDocument(doc);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "music-lyrics" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('music-lyrics.musicLyrics', async () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('My first extension');
		const userInput = await vscode.window.showInputBox();
		if (userInput !== undefined) {
			const music = await searchMusic(userInput);
			await getLyrics(music);
		} else {
			vscode.window.showErrorMessage("You have not written anything");
		}

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
