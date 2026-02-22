# Log into GitHub so you can push (step-by-step)

Do these steps **in your own terminal** (the one in Cursor or your computer).

---

## Step 1: Start the login

In the terminal, go to your project and run:

```bash
cd /home/conno/cheesegrater
./bin/gh auth login -w -h github.com -p https --skip-ssh-key
```

(If `gh` is already in your PATH, you can just run: `gh auth login -w -h github.com -p https --skip-ssh-key`)

---

## Step 2: Copy the one-time code

The command will print something like:

```
First copy your one-time code: XXXX-XXXX
Open this URL to continue in your web browser: https://github.com/login/device
```

**Copy the code** (e.g. `3268-F583`).

---

## Step 3: Open the link in your browser

- Click the link **https://github.com/login/device** (or paste it into your browser).
- If you’re not logged into GitHub, log in.
- When it asks for the **one-time code**, paste the code you copied.
- Click **Authorize** (or **Continue**).

---

## Step 4: Finish in the terminal

Back in the terminal, when it asks **“Authenticate Git with your GitHub credentials?”** type **Y** and press Enter.

Wait until it says you’re logged in.

---

## Step 5: Tell Git to use GitHub CLI

Run:

```bash
gh auth setup-git
```

(Or: `./bin/gh auth setup-git` if you’re using the local `gh`.)

---

## Step 6: Push your code

From the time tracker folder:

```bash
cd /home/conno/cheesegrater/tythe-time-tracker
git push origin main
```

It should push without asking for a password.

---

**If you don’t have `gh`:** you can use a **Personal Access Token** instead:

1. On GitHub: **Profile (top right) → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)**.
2. Name it (e.g. “Cursor push”), tick **repo**, then **Generate token** and copy the token.
3. When you run `git push`, use your **GitHub username** and paste the **token** when it asks for a password.
