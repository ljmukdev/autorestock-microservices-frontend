# Namecheap Private Email Setup with Cloudflare DNS

## 📋 Step-by-Step Guide

### Step 1: Go to Cloudflare DNS Settings

1. Log into Cloudflare Dashboard
2. Select your domain: **autorestock.app** (or ljmuk.co.uk - whichever you're using)
3. Go to **DNS** → **Records**

---

### Step 2: Add MX Records (Required for Receiving Email)

**Click "+ Add record"** and create these **TWO** MX records:

**MX Record 1:**
- Type: `MX`
- Name: `@` (or leave blank - means root domain)
- Mail server: `mx1.privateemail.com`
- Priority: `10`
- TTL: Auto
- Click **Save**

**MX Record 2:**
- Type: `MX`
- Name: `@`
- Mail server: `mx2.privateemail.com`
- Priority: `10`
- TTL: Auto
- Click **Save**

---

### Step 3: Add SPF Record (Required for Sending Email)

**Click "+ Add record":**

- Type: `TXT`
- Name: `@`
- Content: `v=spf1 include:spf.privateemail.com ~all`
- TTL: Auto
- Click **Save**

---

### Step 4: Add DKIM Record (Required - Generate First)

**IMPORTANT:** You must create a mailbox first, then generate the DKIM record.

**After creating mailbox in Namecheap:**
1. Follow Namecheap's guide to generate DKIM
2. You'll get a record like: `v=DKIM1; k=rsa; p=MIGfMA0GCSq...`
3. Add it to Cloudflare:
   - Type: `TXT`
   - Name: `default._domainkey`
   - Content: `<paste the DKIM value from Namecheap>`
   - Click **Save**

---

### Step 5: Add Optional Records (Recommended)

**These improve email client compatibility:**

**CNAME Record 1 (Webmail):**
- Type: `CNAME`
- Name: `mail`
- Target: `privateemail.com`
- Proxy status: DNS only (gray cloud)
- Click **Save**

**CNAME Record 2 (Autodiscover - Outlook):**
- Type: `CNAME`
- Name: `autodiscover`
- Target: `privateemail.com`
- Proxy status: DNS only
- Click **Save**

**CNAME Record 3 (Autoconfig - Thunderbird):**
- Type: `CNAME`
- Name: `autoconfig`
- Target: `privateemail.com`
- Proxy status: DNS only
- Click **Save**

**SRV Record (Autodiscover):**
- Type: `SRV`
- Name: `_autodiscover._tcp`
- Service: `_autodiscover`
- Protocol: `_tcp`
- Priority: `0`
- Weight: `0`
- Port: `443`
- Target: `privateemail.com`
- Click **Save**

---

## ⏱️ Wait for Propagation

DNS changes can take **5-30 minutes** to propagate globally.

**Check status:**
```bash
# Check MX records
nslookup -type=mx autorestock.app

# Check SPF
nslookup -type=txt autorestock.app
```

---

## 📧 Step 6: Create Email Account in Namecheap

1. Go to Namecheap Dashboard
2. Navigate to Private Email
3. Create mailbox: `noreply@autorestock.app`
4. Set a password
5. **Generate DKIM** (follow Namecheap's guide)
6. Add DKIM record to Cloudflare (see Step 4)

---

## 🔧 Step 7: Get SMTP Credentials

After creating the mailbox:

**SMTP Settings for AutoRestock:**
```
SMTP Host: mail.privateemail.com
SMTP Port: 587 (STARTTLS) or 465 (SSL)
SMTP Username: noreply@autorestock.app
SMTP Password: <password-you-set>
SMTP From: AutoRestock <noreply@autorestock.app>
```

---

## 🚀 Step 8: Add to Railway

**Go to:** Railway → AutoRestock-User-Service → **Variables**

**Add:**
```
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_USER=noreply@autorestock.app
SMTP_PASS=<your-password>
SMTP_FROM=AutoRestock <noreply@autorestock.app>
SMTP_SECURE=false
```

(If using port 465, set `SMTP_SECURE=true`)

---

## ✅ Verification Checklist

After setup:
- [ ] MX records added (mx1 and mx2.privateemail.com)
- [ ] SPF record added
- [ ] Mailbox created in Namecheap
- [ ] DKIM generated and added to Cloudflare
- [ ] Optional CNAME/SRV records added
- [ ] Wait 30 minutes for DNS propagation
- [ ] Test sending email from Namecheap webmail
- [ ] Add SMTP credentials to Railway
- [ ] Test sending from AutoRestock

---

## 🎯 Quick Start

1. **Add MX and SPF records first** (5 min)
2. **Create mailbox in Namecheap** (2 min)
3. **Generate and add DKIM** (3 min)
4. **Wait for DNS propagation** (5-30 min)
5. **Add SMTP to Railway** (1 min)
6. **Test!**

---

**Start by adding the MX and SPF records to Cloudflare DNS now!** 📧





