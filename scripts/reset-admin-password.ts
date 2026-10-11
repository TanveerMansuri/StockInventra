import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

function promptHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Handle password masking if terminal is interactive
    const stdin = process.stdin as any;
    const isTTY = stdin.isTTY;

    if (isTTY) {
      process.stdout.write(query);
      stdin.setRawMode(true);
      stdin.resume();

      let password = "";
      const onData = (char: Buffer) => {
        const c = char.toString("utf8");

        // Handle Return / Enter
        if (c === "\n" || c === "\r" || c === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          rl.close();
          process.stdout.write("\n");
          resolve(password);
        } else if (c === "\u0003") {
          // Ctrl+C
          process.stdout.write("\n");
          process.exit(1);
        } else if (c === "\b" || c === "\x7f") {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
          }
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

function promptText(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main() {
  console.log("=== Stock Inventra Admin Password Reset Utility ===");
  console.log("This utility securely updates the password hash in the PostgreSQL database.\n");

  const emailInput = process.env.ADMIN_EMAIL || (await promptText("Enter Admin Email [default: admin@stockinventra.com]: "));
  const email = (emailInput || "admin@stockinventra.com").trim().toLowerCase();

  if (!isValidEmail(email)) {
    console.error(`\n[Error] "${email}" is not a valid email address.`);
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD;

  if (!password) {
    password = await promptHidden("Enter New Admin Password (min 6 characters): ");
    if (password.length < 6) {
      console.error("\n[Error] Password must be at least 6 characters long.");
      process.exit(1);
    }

    const confirmPassword = await promptHidden("Confirm New Admin Password: ");
    if (password !== confirmPassword) {
      console.error("\n[Error] Passwords do not match.");
      process.exit(1);
    }
  } else if (password.length < 6) {
    console.error("\n[Error] ADMIN_PASSWORD environment variable must be at least 6 characters long.");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    if (!user) {
      console.log(`\nUser with email "${email}" not found. Creating new Administrator account...`);
      await prisma.user.create({
        data: {
          email,
          name: "Admin User",
          passwordHash,
          role: "ADMIN",
        },
      });
      console.log(`[Success] Created administrator account for "${email}".`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      // Invalidate active sessions for security
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      console.log(`\n[Success] Password hash updated successfully for "${email}". All existing sessions have been terminated.`);
    }
  } catch (error: any) {
    console.error("\n[Database Error] Failed to update password in database:", error.message || "Connection error. Ensure PostgreSQL is running.");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("\n[Fatal Error]:", e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
