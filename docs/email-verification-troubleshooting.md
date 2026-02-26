# Email Verification Troubleshooting

If you or your users are not receiving verification emails, or if the links are not working, check the following common issues.

## 1. SMTP Not Configured (Local Development)

By default, KariSuite does not send emails in local development unless `SMTP_USER` and `SMTP_PASS` are set in your `.env` file.

**Symptom**: No email arrives. Server logs show:
`[EmailService] INFO: SMTP not configured. Verification link for ...`

**Fix**: Look at the server console output. The verification link is logged there for convenience. Copy and paste it into your browser to verify the account.

## 2. Incorrect APP_BASE_URL

The verification link sent in the email is generated using the `APP_BASE_URL` environment variable.

**Symptom**: Verification link in email points to `http://localhost:3000` even in production, or leads to a 404/Connection Refused error.

**Fix**: Ensure `APP_BASE_URL` is set correctly in your production environment (e.g., `https://your-app.com`).

## 3. Rate Limiting

To prevent spam, KariSuite limits verification email resends to **5 per hour per venue**.

**Symptom**: Clicking "Resend" shows an error: "Too many resend attempts. Please try again in X minutes."

**Fix**: Wait the indicated amount of time before trying again.

## 4. Token Expired

Verification tokens are valid for **24 hours**.

**Symptom**: Clicking the link shows "Verification token has expired".

**Fix**: Log in to your dashboard and click "Resend verification email" in the banner to get a new link.

## 5. Spam Folder

Emails from `noreply@karisuite.com` (or your configured `EMAIL_FROM`) may be flagged as spam.

**Symptom**: Email never arrives.

**Fix**: Check your Spam or Junk folder. Add the sender address to your contacts to ensure future delivery.

## 6. SMTP Authentication Failures

If you have configured SMTP but emails are still not sending.

**Symptom**: Server logs show `[EmailService] verification_email_failed reason=...`

**Fix**: Verify your `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` settings. If using Gmail, ensure you are using an "App Password".
