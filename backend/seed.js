const prisma = require('./src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword, // Memastikan jika akun sudah ada, password direset ke admin123
      role: 'ADMIN'
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Akun Admin Permanen Berhasil Dibuat!');
  console.log('Username: admin');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });