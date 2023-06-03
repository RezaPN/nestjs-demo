const fs = require('fs');
const path = require('path');

function getDirectoryTree(startPath, depth = 0) {
    let tree = '';

    if (fs.lstatSync(startPath).isDirectory()) {
        const indent = '  '.repeat(depth);
        const dirName = path.basename(startPath);
        tree += `${indent}${dirName}/\n`;

        const children = fs.readdirSync(startPath);
        children.forEach(child => {
            const childPath = path.join(startPath, child);
            tree += getDirectoryTree(childPath, depth + 1);
        });
    }

    return tree;
}

console.log(getDirectoryTree('./src'));