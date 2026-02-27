# Email Setup for KariSuite

KariSuite sends verification emails via SMTP. Two options:

---

## Option A: Gmail (personal account) — quickest for local dev

1. **Enable 2FA** on your Google account: [myaccount.google.com/security](https://myaccount.google.com/security)
2. **Create an App Password**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device, then Generate
   - Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)
3. **Add to `src/.env`**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM="KariSuite <your-gmail@gmail.com>"
   APP_BASE_URL=http://localhost:3000
   ```
4. Restart the server.

---

## Option B: Google Workspace SMTP Relay

For production with a custom domain.

1.  **Google Admin Console**:
    *   Go to `Apps` > `Google Workspace` > `Gmail` > `Routing`.
    *   Find the **SMTP relay service** setting.
    *   Click **Configure** or **Add Another**.
    *   **Allowed senders**: "Only addresses in my domains" (recommended) or "Any addresses" (if you want more flexibility).
    *   **Authentication**: "Only accept mail from the specified IP addresses" (add Cloud Run outbound IPs if possible) OR "Require SMTP Authentication".
        *   If using SMTP Authentication, you must use a Workspace user account and password (or App Password).
    *   **Encryption**: Check "Require TLS encryption".

2.  **App Passwords** (if using 2FA):
    *   If the SMTP user has 2FA enabled, generate an **App Password** at `myaccount.google.com` > `Security` > `App passwords`.

3.  **Secrets**:
    *   Configure the following secrets in Google Cloud Secret Manager (see `docs/secret-manager-setup.md`):
        *   `SMTP_HOST`: `smtp-relay.gmail.com`
        *   `SMTP_PORT`: `587` (TLS) or `465` (SSL)
        *   `SMTP_USER`: Your Google Workspace email address
        *   `SMTP_PASS`: Your App Password or account password
        *   `EMAIL_FROM`: `KariSuite <noreply@yourdomain.com>`

## Usage in KariSuite

KariSuite uses `nodemailer` to connect to this relay. It implements:
- 3 retries with exponential backoff.
- Rate limiting (5/hour per venue).
- Secure TLS connection.
