const path = require('node:path');
const chalk = require('chalk');
const notes = '../BED2024Apr_P05_S10257564/Week01/Practical01/files/notes.txt';

path.dirname(notes);
path.basename(notes);
path.extname(notes);

const fs = require('node:fs');

fs.readFile(notes, 'utf8', (err,data) => {
    if(err){
        console.error(err);
        return;
    }
    console.log(data);
})

const content = 'Some content!';

fs.writeFile('../BED2024Apr_P05_S10257564/Week01/Practical01/files/notes.txt',content,err => {
    if(err){
        console.log(err);
    }
    else{
        console.log(chalk.red("File written successfully"));
    }
})
