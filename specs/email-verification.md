# Spec: Email Verification

## Overview

New user accounts require email verification before they can log in. A verification email is sent on account creation containing a one-time link.

---

## Flow

1. Manager creates a new user account
2. Server sends verification email to the user's email address
3. Email contains a unique token link: `https://<app>/verify?token=<token>`
4. User clicks link → server validates token → account marked `email_verified = true`
5. User can now log in

---

## Fallback (verification-fallback)

If email delivery fails (SMTP error, bounce), the manager can:
- View the verification link directly in the admin UI
- Copy/share it manually

---

## Data model additions

```
users
├── email              TEXT NULL  -- user's email address
├── email_verified     BOOLEAN DEFAULT false
└── verification_token TEXT NULL  -- one-time token; cleared after use
```

---

## Email sending

- SMTP via environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- Email subject: "Verify your Tythe Barn account"
- Email body: plain text + HTML with verification link
- Token: UUID or cryptographically random string, expires after 48 hours

---

## Token validation

- `GET /verify?token=<token>`
- Find user by token; check token not expired
- Set `email_verified = true`, clear `verification_token`
- Redirect to login with success message

---

## Acceptance criteria

- [ ] Verification email sent when manager creates a new user
- [ ] Verification link in email contains a valid unique token
- [ ] Clicking link marks account as verified
- [ ] User cannot log in before email is verified (if verification required)
- [ ] Expired or invalid token returns an error
- [ ] Manager can view/copy verification link if email delivery fails
- [ ] Token is single-use (cleared after verification)
