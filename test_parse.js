const fs = require('fs');
const glob = require('glob');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const files = fs.readdirSync('.').filter(f => f.includes('counselling.html') && (f.includes('-mbbs-') || f.includes('-ayush-')));
let total = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf-8');
  const dom = new JSDOM(html);
  const tables = dom.window.document.querySelectorAll('.ctbl');
  let count = 0;
  tables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr');
    count += rows.length;
  });
  console.log(`${file}: ${count} colleges`);
  total += count;
}
console.log(`Total: ${total}`);
