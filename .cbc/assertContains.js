const fs = require('fs')

var fileToReadPath = process.argv[2];
var required = process.argv[3].split(',');

const data = fs.readFileSync(fileToReadPath, 'utf8')
required.forEach(string => {
    assertContains(data, string);
});

function assertContains(data, string) {
    if (!data.includes(string)) {
        throw ("Error: File does not contain " + string);
    }
}