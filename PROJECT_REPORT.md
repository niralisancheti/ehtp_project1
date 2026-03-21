# Project Title
Detection and Analysis of Common Web Vulnerabilities, Cyber Attacks, and Malware Behaviour in Computer Networks

---

# Project Objective
1. To study common web application vulnerabilities affecting computer networks.
2. To understand different types of cyber attacks and their impact on systems and networks.
3. To analyze basic malware behavior and its effects on computer systems.
4. To perform vulnerability detection using standard ethical hacking tools in a controlled environment.
5. To create awareness about security risks and preventive measures in computer networks.

---

# Project Outcome
After successful completion of this project, students will be able to:
1. Identify common web vulnerabilities in web applications.
2. Understand the working and impact of cyber attacks on computer networks.
3. Analyze malware behavior and its effects on systems.
4. Use ethical hacking tools responsibly for security assessment.
5. Develop awareness of security best practices and countermeasures.

---

# Project Description

## 1. Definition

Web vulnerabilities are security weaknesses present in web applications that can be exploited by attackers to gain unauthorized access, steal data, or disrupt services. These vulnerabilities arise due to improper input validation, weak authentication mechanisms, misconfigured servers, and insecure coding practices.

Cyber attacks are malicious attempts to exploit these vulnerabilities. Common web-based attacks include SQL Injection, Cross-Site Scripting (XSS), Broken Access Control, and Unrestricted File Upload.

Malware refers to malicious software designed to damage or disrupt systems. While this project does not execute malware, it studies how certain vulnerabilities (like file upload flaws) can allow malware delivery.

This project focuses on identifying and analyzing four common web vulnerabilities in a self-developed Student Portal web application using ethical hacking principles in a controlled lab environment.

---

## 2. Methodology

The project was conducted using a systematic approach as follows:

### Requirement Analysis
- Designed a Student Portal Web Application.
- The portal includes:
  - Login system
  - Comment/feedback section
  - File upload feature
  - Student dashboard
- Defined scope strictly within local lab environment (localhost).

### Information Gathering
- Studied application structure.
- Identified input fields, login module, file upload module.
- Identified possible attack surfaces such as:
  - Login form
  - Comment box
  - File upload section
  - Direct file access URLs

### Vulnerability Detection

The following vulnerabilities were detected:

**1. SQL Injection**
Payload used:
`' OR '1'='1`

Observation:
Login authentication was bypassed due to improper query validation.

Impact:
- Unauthorized access
- Database manipulation risk

**2. Stored Cross-Site Scripting (Stored XSS)**
Payload used in comment box:
`<script>alert("XSS Attack Demo")</script>`

Observation:
The script was stored in database and executed when page loaded.

Impact:
- Session hijacking
- Cookie theft
- Malicious redirection

**3. Broken Access Control / Insecure Direct Object Reference (IDOR)**
Procedure:
- Uploaded a file in student dashboard.
- Copied file URL.
- Opened file in different browser session.

Observation:
File was accessible without authentication verification.

Impact:
- Unauthorized file access
- Data leakage

**4. Unrestricted File Upload Vulnerability**
Procedure:
- Uploaded test.html file even though only .doc, .pdf, .zip were allowed.
- File was successfully uploaded and executed.

Observation:
Server did not validate file type properly.

Impact:
- Malicious file upload possible
- Potential Stored XSS
- Possible remote code execution (in real-world case)

### Tools Used
Basic manual testing was performed.

For vulnerability verification, reference was taken from:
- OWASP ZAP
- Burp Suite

All testing was performed ethically on self-developed system.

### Result Analysis and Documentation
Each vulnerability was analyzed based on:
- Attack methodology
- Root cause
- Impact severity
- Risk to network and system

Screenshots were captured for:
- SQL login bypass
- XSS popup
- File URL access
- HTML file upload execution

---

## 3. Implementation

The implementation was carried out in a controlled laboratory environment using a locally hosted Student Portal web application.

Steps performed:
1. Designed weak authentication logic to test SQL Injection.
2. Stored unsanitized user inputs to demonstrate Stored XSS.
3. Allowed direct file access without session validation to demonstrate IDOR.
4. Disabled strict file type validation to demonstrate Unrestricted File Upload.

All demonstrations were performed ethically without affecting any external system. No real-world server or production system was targeted.

---

## 4. Output & Evidence

The project generated the following outputs:
- Screenshot of SQL Injection login bypass
- Screenshot of XSS popup execution
- Screenshot of unauthorized file access via URL
- Screenshot of HTML file upload and execution
- Table summarizing vulnerability type and severity
- Observations and impact analysis

---

### SQL Injection login bypass:
**[ADD SCREENSHOT HERE - Login page showing SQL injection payload and successful bypass]**

---

### Unrestricted File Upload:
**[ADD SCREENSHOT HERE - File upload page showing .html file successfully uploaded]**

---

### Stored Cross Site Scripting:
**[ADD SCREENSHOT HERE - Comment box with XSS payload and alert popup]**

---

### Broken Access Control (IDOR):
**[ADD SCREENSHOT HERE - File URL accessed in different session without authentication]**

---

## Vulnerability Severity Table

| Vulnerability | Severity | Impact |
|---------------|----------|--------|
| SQL Injection | Critical | Unauthorized database access |
| Stored XSS | High | Session hijacking, data theft |
| Broken Access Control (IDOR) | High | Unauthorized file access |
| Unrestricted File Upload | High | Malware upload, RCE |

---

## 5. Conclusion

This project successfully detected and analyzed four major web application vulnerabilities in a controlled environment:
- SQL Injection
- Stored Cross-Site Scripting
- Broken Access Control (IDOR)
- Unrestricted File Upload

The study helped in understanding how insecure coding practices can expose computer networks to serious cyber threats. It also created awareness about the importance of secure coding, input validation, authentication mechanisms, and file handling practices.

The project aligns with ethical hacking principles and demonstrates responsible vulnerability assessment.

---

## Screenshots Guide

| Screenshot | What to Capture | Where to Place |
|------------|----------------|----------------|
| 1. SQL Injection | Login page with `' OR '1'='1` payload and successful bypass to dashboard | After "SQL Injection login bypass" |
| 2. Unrestricted File Upload | File upload showing .html file accepted and uploaded | After "Unrestricted File Upload" |
| 3. Stored XSS | Comments page with `<script>alert("XSS")</script>` and popup executing | After "Stored Cross Site Scripting" |
| 4. IDOR | File URL opened in new browser/incognito without login | After "Broken Access Control (IDOR)" |
