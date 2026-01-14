#!/bin/bash
OUTPUT_FILE="$(pwd)/ops-check.log"
echo "Starting Ops Check at $(date)" > "$OUTPUT_FILE"
echo "----------------------------------------" >> "$OUTPUT_FILE"

echo "1. Testing SSH Connection..." >> "$OUTPUT_FILE"
ssh -o BatchMode=yes -o ConnectTimeout=5 debian-server "hostname && echo 'SSH OK'" >> "$OUTPUT_FILE" 2>&1
SSH_EXIT=$?
echo "SSH Exit Code: $SSH_EXIT" >> "$OUTPUT_FILE"





if [ $SSH_EXIT -eq 0 ]; then
    echo "----------------------------------------" >> "$OUTPUT_FILE"
    echo "2. Securing .env (chmod 600)..." >> "$OUTPUT_FILE"
    ssh debian-server "chmod 600 /var/www/matland-gard/.env && ls -l /var/www/matland-gard/.env" >> "$OUTPUT_FILE" 2>&1
    
    echo "----------------------------------------" >> "$OUTPUT_FILE"
    echo "3. Checking Git Status (Remote)..." >> "$OUTPUT_FILE"
    ssh debian-server "cd /var/www/matland-gard && git config --global --add safe.directory /var/www/matland-gard && git status && echo 'Last Commit:' && git log -1 --format='%h %s'" >> "$OUTPUT_FILE" 2>&1
else




    echo "Skipping remote checks due to SSH failure." >> "$OUTPUT_FILE"
fi

echo "----------------------------------------" >> "$OUTPUT_FILE"
echo "Done." >> "$OUTPUT_FILE"
