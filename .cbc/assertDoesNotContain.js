const fs = require('fs')

var fileToReadPath = process.argv[2];
var notAllowed = process.argv[3].split(',');

const data = fs.readFileSync(fileToReadPath, 'utf8')
notAllowed.forEach(string => {
    assertDoesNotContain(data, string);
});

function assertDoesNotContain(data, string) {
    if (data.includes(string)) {
        throw ("Error: File contains " + string);
    }
}