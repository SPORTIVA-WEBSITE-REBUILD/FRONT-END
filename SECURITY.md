# Security Policy

## Reporting a vulnerability

If you believe you have found a security issue on the PCN Sportiva LP website, please
report it privately by email to **contact@pcnsportivalp.com** with the subject line
"Security report".

Please do not open a public GitHub issue or post details elsewhere before we have
had a chance to fix the problem.

Helpful details to include:

- What you found and the page or URL where it happens.
- Steps to reproduce it, or a short proof of concept.
- What you think the impact is.
- Your name or handle if you would like credit.

We aim to acknowledge a report within 5 working days and to keep you updated until
it is resolved. We will not take legal action against anyone who reports an issue
in good faith, avoids accessing other people's data, and does not disrupt the
service.

## Scope

This repository is the public website (React, hosted on Netlify) at
pcnsportivalp.com, including the webinar registration form.

In scope: the website's pages and scripts, how it handles form input, and anything
that could expose visitor data.

Out of scope: denial-of-service by sheer traffic volume, social engineering of staff,
and issues in third-party services (Netlify, Cloudinary, embedded video providers)
that should be reported to those providers directly. The API and admin dashboard
have their own repositories and policies.

## What is in place

- HTTPS only, with HSTS.
- Security headers on every page: `X-Frame-Options`, `X-Content-Type-Options`,
  a strict referrer policy, and a restrictive `Permissions-Policy`.
- The Google Meet link is never sent to the browser; the public API does not
  return it.
- The old `netlify.app` address permanently redirects to the real domain.
- Dependencies are checked with `npm audit`.
