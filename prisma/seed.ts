import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

function promptHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin as any;
    const isTTY = stdin.isTTY;

    if (isTTY) {
      process.stdout.write(query);
      stdin.setRawMode(true);
      stdin.resume();

      let password = "";
      const onData = (char: Buffer) => {
        const c = char.toString("utf8");
        if (c === "\n" || c === "\r" || c === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          rl.close();
          process.stdout.write("\n");
          resolve(password);
        } else if (c === "\u0003") {
          process.stdout.write("\n");
          process.exit(1);
        } else if (c === "\b" || c === "\x7f") {
          if (password.length > 0) password = password.slice(0, -1);
        } else {
          password += c;
        }
      };
      stdin.on("data", onData);
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log('--- Initializing Stock Inventra Foundation Database ---');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stockinventra.com';
  let adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.log(`Setting up administrator credentials for: ${adminEmail}`);
    adminPassword = await promptHidden('Enter initial administrator password (min 6 characters): ');
    if (!adminPassword || adminPassword.length < 6) {
      console.error('\n[Error] Admin password must be at least 6 characters long.');
      console.error('Tip: You can also specify ADMIN_PASSWORD in environment or run: ADMIN_PASSWORD="your-secure-password" yarn db:seed');
      process.exit(1);
    }
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const category = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic items and gadgets',
      status: 'ACTIVE',
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
