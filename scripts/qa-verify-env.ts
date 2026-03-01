import { config } from 'dotenv';
import chalk from 'chalk';

// Load environment variables
config();

// Simple color helper if chalk isn't available or just to keep it simple
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const pass = (msg: string) => console.log(`${colors.green}[PASS] ${msg}${colors.reset}`);
const fail = (msg: string) => console.log(`${colors.red}[FAIL] ${msg}${colors.reset}`);
const warn = (msg: string) => console.log(`${colors.yellow}[WARN] ${msg}${colors.reset}`);
const info = (msg: string) => console.log(`${colors.blue}[INFO] ${msg}${colors.reset}`);

const requiredVars = [
    'DATABASE_URL',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_URL'
];

function verifyEnv() {
    console.log('Verifying Environment Variables...\n');

    let hasError = false;

    for (const key of requiredVars) {
        const value = process.env[key];
        if (!value) {
            fail(`Missing: ${key}`);
            hasError = true;
        } else {
            // Mask sensitive values
            let displayValue = value;
            if (key.includes('KEY') || key.includes('PASSWORD') || key.includes('URL')) {
                if (value.length > 8) {
                    displayValue = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
                } else {
                    displayValue = '***';
                }
            }
            pass(`Found: ${key} (${displayValue})`);
        }
    }

    // Check specific formats if needed
    if (process.env.NEXT_PUBLIC_URL) {
        try {
            new URL(process.env.NEXT_PUBLIC_URL);
        } catch (e) {
            fail(`NEXT_PUBLIC_URL is not a valid URL: ${process.env.NEXT_PUBLIC_URL}`);
            hasError = true;
        }
    }

    console.log('\n');
    if (hasError) {
        console.log(`${colors.red}Environment verification FAILED.${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`${colors.green}Environment verification PASSED.${colors.reset}`);
    }
}

verifyEnv();
