# 10am — DNS & email setup (for Silke)

This connects **10amanywhere.com** to the new website and lets the site send email
(login links, the newsletter) from a 10am address. It is all done in **one place**:
wherever the domain `10amanywhere.com` is managed — most likely **Hostinger** (where
the current site lives), under **Domains → DNS / Nameservers → DNS records**.

You are adding records below. You are **not** deleting anything except where noted in Step 1.

---

## Step 1 — Point the website to the new site (2 records)

Find the existing **A record** for the root domain (Host `@`, currently pointing at
Hostinger) and **change its value**, then add the `www` record:

| Type  | Host / Name | Value                  | Notes                    |
|-------|-------------|------------------------|--------------------------|
| A     | `@`         | `76.76.21.21`          | Replaces the old A record |
| CNAME | `www`       | `cname.vercel-dns.com` | Add new                  |

> **Important:** this is the go-live switch. Once it takes effect (a few minutes to
> a few hours), **10amanywhere.com shows the new site** instead of the old one.

---

## Step 2 — Let 10am send email (3 records)

Add these three records exactly as written (Host names are short on purpose — your
registrar adds `.10amanywhere.com` automatically):

| Type | Host / Name        | Value                                              | Priority |
|------|--------------------|----------------------------------------------------|----------|
| MX   | `send`             | `feedback-smtp.us-east-1.amazonses.com`            | `10`     |
| TXT  | `send`             | `v=spf1 include:amazonses.com ~all`                | —        |
| TXT  | `resend._domainkey`| (the long key below — paste it whole)              | —        |

**The TXT value for `resend._domainkey`** (copy the entire line):

```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCr2YxpdNlfcsnXeR2Vm+br+/OHTFZZhL2aaehro9GyuT0fLWmu6aco/U/SSlTWt587keLukJeagw1qXvsAI46IwhHtEx7Wty8FpJSTqJHb7gnxZZbjiu/0B11hgZ/e/eV3ERzCjKAGtRrb6sWpHBQZpQqJ9lTnZpQWmnPrfQmqAQIDAQAB
```

---

## Step 3 — Tell Korede

Once you have added all five records, **let Korede know.** He finishes the rest from
his side (verifying the domain, switching the site's emails to send from
`hello@10amanywhere.com`, and confirming the SSL certificate). Nothing else for you to do.

---

### Quick reference — all records at a glance
```
WEBSITE
  A      @                    76.76.21.21
  CNAME  www                  cname.vercel-dns.com

EMAIL
  MX     send                 feedback-smtp.us-east-1.amazonses.com   (priority 10)
  TXT    send                 v=spf1 include:amazonses.com ~all
  TXT    resend._domainkey    p=MIGfMA0GCSq... (full key above)
```
