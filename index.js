/**
 * Beginner's Series to Node.js
 * 1. Navigate filesystem
 * 2. Find the files that have intended extension(like .json)
 * 3. Join the paths with the chars corresponding to the OS
 * 4. Create a new file or directory
 * 5. Read and write a json file
 */

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
	const salesFiles = await findSalesFilesRecursively(path.join(__dirname, "stores"));
	console.log(salesFiles);

	const salesTotal = await calculateSalesTotal(salesFiles);
	const report = {
		salesTotal,
		totalStores: salesFiles.length,
	};

	const reportPath = path.join(salesTotalsDir, "report.json");
	// Remove the file since writeFile() opens a file with append mode by default. But what we gonna do is override.
	try {
		await fs.unlink(reportPath);
	} catch {
		console.log("Failed to remove" + reportPath);
	}

	// Override
	// filename, context
	// JSON.stringify: Converts a JavaScript value to a JavaScript Object Notation (JSON) string. Third param specifies the indent size.
	// writeFile() takes string type.
	await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
	console.log("Sales report written to " + salesTotalsDir);
}

main();

async function findSalesFilesRecursively(folderName) {
	let salesFiles = [];

	// fs.readdir() takes foldername and returns the info inside it.
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

async function calculateSalesTotal(salesFiles) {
	let salesTotal = 0;
	for (file of salesFiles) {
		// JSON.parse(): Converts a JavaScript Object Notation (JSON) string into an object. Also tolerates buffer.
		// readFile() returns buffer not file contents. Buffer is a reserved area to store binary data in memory.
		// If there is a necessity to read string data, give a encode format to the 2nd param.
		const data = JSON.parse(await fs.readFile(file));
		salesTotal += data.total;
	}
	return salesTotal;
}
