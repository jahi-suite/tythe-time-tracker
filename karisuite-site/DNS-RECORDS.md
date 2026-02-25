# DNS records for karisuite.com

Add these records in your DNS provider (Google Workspace / Squarespace / etc.).

## karisuite.com (root domain, use `@` or blank host)

**Remove** any existing CNAME for `@` to `ghs.googlehosted.com`.

**Add A records** (one per line, or your provider may allow multiple values):

| Type | Host | Value |
|------|------|-------|
| A | @ | 216.239.32.21 |
| A | @ | 216.239.34.21 |
| A | @ | 216.239.36.21 |
| A | @ | 216.239.38.21 |

**Add AAAA records** (IPv6):

| Type | Host | Value |
|------|------|-------|
| AAAA | @ | 2001:4860:4802:32::15 |
| AAAA | @ | 2001:4860:4802:34::15 |
| AAAA | @ | 2001:4860:4802:36::15 |
| AAAA | @ | 2001:4860:4802:38::15 |

## www.karisuite.com

| Type | Host | Value |
|------|------|-------|
| CNAME | www | ghs.googlehosted.com. |

---

**Note:** DNS changes can take a few minutes to 48 hours to propagate. After adding these, karisuite.com and www.karisuite.com will show the Kari Suite homepage. time.karisuite.com stays as the Kari Time app.
