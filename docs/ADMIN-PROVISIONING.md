# Admin Provisioning — SIDESTAGE

Tidak ada endpoint publik untuk promosi role. Prosedur yang aman untuk owner:

## 1. Register akun biasa
Daftar lewat UI (`/register`) dengan email yang dimiliki owner.

## 2. Promosi role (server-side only)
Jalankan di work environment (kredensial DB ada di `~/.hermes/.env`):

```bash
set -a; . ~/.hermes/.env; set +a
cat > /tmp/promote.mjs <<'EOF'
import Database from 'libsql';
const db = new Database(process.env.TURSO_DATABASE_URL, { authToken: process.env.TURSO_AUTH_TOKEN });
const email = process.argv[2];
if (!email) throw new Error('usage: node promote.mjs <email>');
const r = db.prepare("UPDATE users SET role='admin' WHERE lower(email)=lower(?)").run(email);
console.log('promoted rows:', r.changes);
EOF
node /tmp/promote.mjs "email@lu.com"; rm /tmp/promote.mjs
```

## Catatan keamanan
- Password TIDAK pernah diketahui/di-set oleh pihak lain — owner set sendiri via `/register`.
- Session admin bisa dicabut kapan saja: `DELETE FROM sessions WHERE user_id = <id>`.
- Role di-check di `requireAdmin()` pada setiap endpoint admin; tidak ada promosi via HTTP.
- Script `scripts/promote-admin.mjs` tersedia sebagai pembungkus prosedur di atas.
