const fs = require("fs").promises;
const path = require("path");

async function main() {
	const salesDir = path.join(__dirname, "stores");
	const salesTotalsDir = path.join(__dirname, "salesTotals");

	// Use try-catch instead that check if the directory exists and it's not then execute mkdir().
	// Because there is a possibility to happen the race-condition in asynchronous environment.
	// But try-catch can detect and avoid to happen the race-condition.
	try {
		await fs.mkdir(salesTotalsDir);
	} catch {
		log("exits");
	}

	// Using __direname can get absolute path. By this, program outputs the same result regardless of where it's executed at.
	// path.join() joins its params with correct separation character according to the OS.
	console.log(await findSalesFiles(path.join(__dirname, "stores")));
	const salesFiles = await findSalesFilesRecursively(path.join(__dirname, "stores"));
	console.log(salesFiles);

	const reportPath = path.join(salesTotalsDir, "report.json");
	// Remove the file since writeFile() opens a file with append mode by default. But what we gonna do is override.
	try {
		await fs.unlink(reportPath);
	} catch {
		console.log("Failed to remove");
	}

	// override
	// filename, context
	await fs.writeFile(path.join(salesTotalsDir, "report.json"), "");
	console.log("Sales report written to " + salesTotalsDir);
}

main();

async function findSalesFiles(folderName) {
	// fs.readdir() takes foldername and returns the info inside it.
	const storeFiles = await fs.readdir(folderName);
	return storeFiles;
}

async function findSalesFilesRecursively(folderName) {
	let salesFiles = [];

	// Taking the second param, it returns filenames with their meta info instead of only filenames
	const items = await fs.readdir(folderName, { withFileTypes: true });

	for (const item of items) {
		// If item is directory, execute this function recursively with given its folder path.
		if (item.isDirectory()) {
			salesFiles = salesFiles.concat(await findSalesFilesRecursively(path.join(folderName, item.name)));
		} else {
			// If the file type is .json, push it to the list
			if (path.extname(item.name) === ".json") {
				salesFiles.push(path.join(folderName, item.name));
			}
		}
	}
	return salesFiles;
}
