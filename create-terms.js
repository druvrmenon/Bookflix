const fs = require('fs');
const html = fs.readFileSync('BookFlix_Terms_and_Conditions.md', 'utf8').replace(/`/g, '\\`');

const code = `
export default function TermsPage() {
  return (
    <div className="fade-in" style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', marginTop: '24px' }}>
      <div dangerouslySetInnerHTML={{ __html: \`${html}\` }} className="terms-content" />
    </div>
  );
}
`;

fs.writeFileSync('src/app/terms/page.js', code);
console.log('Done');
