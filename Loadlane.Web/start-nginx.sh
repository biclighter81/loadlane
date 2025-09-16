#!/usr/bin/env bash
export EXISTING_VARS=$(printenv | awk -F= '/^APP_[^=]+/ { printf("%s,", "$"$1) }' | sed 's/,$//')
echo $EXISTING_VARS;
if [ -z "$EXISTING_VARS" ]; then
    EXISTING_VARS=""
fi

# Ersetzt die Umgebungsvariablen in den Dateien im JSFOLDER
for file in $JSFOLDER; do
   envsubst "$EXISTING_VARS" < "$file" > "${file}_tmp" && mv "${file}_tmp" "$file"
done

nginx -g 'daemon off;'