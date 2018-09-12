const { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).filter(name => isDirectory(join(source, name)))

function GetReactVersions(packageName, pathToProjects, outputFile) {
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

    const version = JSON.parse(readFileSync(file)).dependencies[packageName];

    if (!version) {
      output['N/A'].push(directory);
      continue;
    }
  
    const subVersions = version.replace(/\^|~/g, "").split('.');
  
    for (const sub of subVersions) {
      const v = parseInt(sub);
  
      if (v > 0) {
        if (!Object.keys(output).includes(String(v))) {
          output[v] = [];
        }
  
        output[v].push(directory);
        break;
      }
    }
  }

  if (outputFile) {
    writeFileSync(outputFile, JSON.stringify(output, null, 3));
  } else {
    console.log(output);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  if (process.argv.length < 4) {
    console.log('Invalid arguments.\nUsage: node GetVersions.js [packageName] [pathToDirectoryContainingProjects] [jsonOutputFile]\n');
    return;
  }

  GetReactVersions(process.argv[2], process.argv[3], process.argv[4]);
}