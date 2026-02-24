# Kari Suite — Main site (karisuite.com)

Static site for the Kari Suite homepage. Deploy to karisuite.com and www.karisuite.com.

- **index.html** — Home page
- **privacy.html** — Privacy policy (links to Kari Time privacy for product details)
- **kari-time-marketing.html** — Redirects to https://time.karisuite.com/

Kari Time (the app) stays at time.karisuite.com — unchanged.

## Deployment

Deploy the contents of this folder to any static host:

- **Google Cloud Storage** + Load Balancer
- **Netlify** — drag and drop or connect repo
- **Cloudflare Pages**
- **Firebase Hosting**

For www.karisuite.com, configure your DNS to point to this site. Ensure both karisuite.com and www.karisuite.com resolve to the same content.
