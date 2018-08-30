const { existsSync, lstatSync, readdirSync, readFileSync } = require('fs')
const { join } = require('path')

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).filter(name => isDirectory(join(source, name)))

function GetReactVersions(pathToProjects) {
  if (!existsSync(pathToProjects)) {
    console.log('Directory does not exist');
    return;
  }

  const directories = getDirectories(pathToProjects);

  const output = {
    "N/A": [],
  };
  
  for (const directory of directories) {
    const file = join(pathToProjects, `${directory}/package.json`);
    if (!existsSync(file)) {
      output['N/A'].push(directory);
      continue;
    }

    const version = JSON.parse(readFileSync(file)).dependencies.react;
  
    if (!version) {
      output['N/A'].push(directory);
      continue;
    }
  
    const subVersions = version.split('.');
  
    for (const sub of subVersions) {
      const v = parseInt(sub.replace(/\^|~/g, ""));
  
      if (v > 0) {
        if (!Object.keys(output).includes(String(v))) {
          output[v] = [];
        }
  
        output[v].push(directory);
        break;
      }
    }
  }

  console.log(output);
}

if (typeof require !== 'undefined' && require.main === module) {
  if (process.argv.length !== 3) {
    console.log('Invalid arguments.\nUsage: node GetReactVersions.js [pathToDirectoryContainingProjects]\n');
    return;
  }

  GetReactVersions(process.argv[2]);
}