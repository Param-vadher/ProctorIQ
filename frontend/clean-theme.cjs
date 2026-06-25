const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Remove ThemeToggle component usages
const filePaths = [
  'pages/student/ExamLobby.tsx',
  'pages/student/Dashboard.tsx',
  'pages/Login.tsx',
  'pages/Register.tsx',
  'pages/Home.tsx',
  'pages/AboutContact.tsx',
  'layouts/AdminLayout.tsx',
  'layouts/TeacherLayout.tsx'
];

filePaths.forEach(file => {
  const fullPath = path.join(srcDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Remove import statement
    content = content.replace(/import ThemeToggle from '[^']+';\r?\n/g, '');
    // Remove component usage
    content = content.replace(/<ThemeToggle \/>/g, '');
    fs.writeFileSync(fullPath, content);
    console.log(`Cleaned ${file}`);
  }
});

// 2. Remove ThemeToggle.tsx
const themeTogglePath = path.join(srcDir, 'components', 'ThemeToggle.tsx');
if (fs.existsSync(themeTogglePath)) {
  fs.unlinkSync(themeTogglePath);
  console.log('Removed ThemeToggle.tsx');
}

// 3. Remove dark theme styles from index.css
const cssPath = path.join(srcDir, 'index.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  // Simple regex to remove all [data-theme='dark'] blocks and .theme-toggle-btn blocks
  // Note: CSS can be complex, this assumes standard formatting
  css = css.replace(/\[data-theme='dark'\][^{]*\{[^}]*\}/g, '');
  css = css.replace(/\.theme-toggle-btn[^{]*\{[^}]*\}/g, '');
  
  // also clean up any trailing empty rules if any, or chained comma selectors
  // A more robust way is to just remove lines with [data-theme='dark'] if they are comma separated
  css = css.replace(/\[data-theme='dark'\][^,]*,[ \t]*\n?/g, '');
  
  fs.writeFileSync(cssPath, css);
  console.log('Cleaned index.css');
}
