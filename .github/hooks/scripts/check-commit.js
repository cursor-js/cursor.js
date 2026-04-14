const fs = require('fs');
const { execSync } = require('child_process');

try {
  const input = fs.readFileSync(0, 'utf-8');
  if (!input) process.exit(0);
  
  const data = JSON.parse(input);
  const toolName = data.toolName;
  const toolArgs = data.toolParameters || data.toolArgs || {};

  let isCommit = false;
  if (toolName === 'git-commit') {
      isCommit = true;
  } else if (toolName === 'execute' && toolArgs.command && typeof toolArgs.command === 'string' && toolArgs.command.includes('git commit')) {
      isCommit = true;
  }

  if (isCommit) {
      try {
          // Commit işlemi yakalandı, testleri zorla!
          execSync('pnpm test', { stdio: 'ignore' });
          console.log(JSON.stringify({
              hookSpecificOutput: {
                  hookEventName: "PreToolUse",
                  permissionDecision: "allow"
              }
          }));
      } catch (e) {
          // Testler patladı, commit'i engelle.
          console.log(JSON.stringify({
              hookSpecificOutput: {
                  hookEventName: "PreToolUse",
                  permissionDecision: "deny",
                  permissionDecisionReason: "⛔ Commit reddedildi: 'pnpm test' başarısız oldu! Lütfen önce testleri düzeltin."
              }
          }));
      }
  } else {
      // Başka bir tool kullanılıyorsa izin ver
      console.log(JSON.stringify({
          hookSpecificOutput: {
              hookEventName: "PreToolUse",
              permissionDecision: "allow"
          }
      }));
  }
} catch (err) {
  process.exit(0); // JSON parse hatası vb. olursa akışı bozma
}
