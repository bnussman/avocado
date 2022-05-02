const fs = require('fs');

let content = '';

console.log(process.env.secrets);

const excludedSecrets = [
  "github_token",
  "DOCKERHUB_TOKEN",
  "DOCKERHUB_USERNAME",
  "KUBE_CONFIG",
];

const secrets = JSON.parse(process.env.secrets);

const keys = Object.keys(secrets);

for (const key of keys) {

  if (excludedSecrets.includes(key)) {
    continue;
  }

  content += `\n  ${key}: "${String(secrets[key])}"`
}

const newlines = content.replace(/\n/, "\\n");

console.log(newlines);

fs.appendFile(`${__dirname}/templates/configmap.yaml`, newlines, err => {
  if (err) {
    console.error(err)
    return
  }
});