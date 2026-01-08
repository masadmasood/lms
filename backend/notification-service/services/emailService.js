/*
  Email Service
  
  This service handles sending emails via SMTP (Gmail).
  
  Configuration:
  - Uses nodemailer for SMTP email sending
  - Supports Gmail SMTP configuration
  - Handles multiple recipients (for same book borrowed by multiple users)
  
  Environment Variables Required:
  - SMTP_HOST: smtp.gmail.com
  - SMTP_PORT: 587
  - SMTP_USER: Your Gmail address
  - SMTP_PASS: Your Gmail App Password (not regular password)
  - SMTP_FROM: Sender email address (usually same as SMTP_USER)
  
  Note: For Gmail, you need to:
  1. Enable 2-Step Verification
  2. Generate an App Password (not your regular password)
  3. Use that App Password in SMTP_PASS
*/

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in notification-service directory
const envPath = join(__dirname, "../.env");
dotenv.config({ path: envPath });
console.log(`[Email Service] Loading .env from: ${envPath}`);

// Load environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

// Debug: Log SMTP configuration status
console.log("[Email Service] SMTP Configuration Check:");
console.log(`[Email Service] SMTP_HOST: ${SMTP_HOST}`);
console.log(`[Email Service] SMTP_PORT: ${SMTP_PORT}`);
console.log(`[Email Service] SMTP_USER: ${SMTP_USER ? 'Set' : 'NOT SET'}`);
console.log(`[Email Service] SMTP_PASS: ${SMTP_PASS ? 'Set' : 'NOT SET'}`);
console.log(`[Email Service] SMTP_FROM: ${SMTP_FROM || 'NOT SET'}`);

let transporter = null;

/*
  Initialize email transporter
  Creates a reusable transporter object using SMTP transport.
*/
const initializeTransporter = () => {
  // Re-read environment variables in case they weren't loaded initially
  const smtpUser = process.env.SMTP_USER || SMTP_USER;
  const smtpPass = process.env.SMTP_PASS || SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT) || SMTP_PORT;
  const smtpFrom = process.env.SMTP_FROM || SMTP_FROM || smtpUser;
  
  console.log("[Email Service] Initializing transporter...");
  console.log(`[Email Service] SMTP_USER: ${smtpUser ? 'Set (' + smtpUser + ')' : 'NOT SET'}`);
  console.log(`[Email Service] SMTP_PASS: ${smtpPass ? 'Set (***)' : 'NOT SET'}`);
  console.log(`[Email Service] SMTP_HOST: ${smtpHost}`);
  console.log(`[Email Service] SMTP_PORT: ${smtpPort}`);
  
  if (!smtpUser || !smtpPass) {
    console.warn("[Email Service] SMTP credentials not configured. Email sending will be disabled.");
    console.warn(`[Email Service] Check your .env file in notification-service directory`);
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });

    console.log("[Email Service] SMTP transporter initialized");
    return transporter;
  } catch (error) {
    console.error("[Email Service] Failed to initialize transporter:", error.message);
    return null;
  }
};

/*
  Verify SMTP connection
  Tests the connection to the SMTP server.
*/
export const verifySMTPConnection = async () => {
  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log("[Email Service] SMTP connection verified");
    return true;
  } catch (error) {
    console.error("[Email Service] SMTP verification failed:", error.message);
    return false;
  }
};

/*
  Send book issued email
  Sends a confirmation email when a book is borrowed.
  
  @param {Object} data - Event data containing borrow information
  @param {string} data.memberEmail - Email address of the borrower
  @param {string} data.memberName - Name of the borrower
  @param {string} data.bookTitle - Title of the borrowed book
  @param {string} data.dueDate - Due date for returning the book
  @param {string} data.borrowId - Unique borrow record ID
*/
export const sendBookIssuedEmail = async (data) => {
  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    console.warn("[Email Service] Cannot send email - SMTP not configured");
    return false;
  }

  const { memberEmail, memberName, bookTitle, dueDate, borrowId } = data;

  if (!memberEmail) {
    console.error("[Email Service] Cannot send email - member email not provided");
    return false;
  }

  // Get SMTP_FROM from environment dynamically
  const smtpFrom = process.env.SMTP_FROM || SMTP_FROM || process.env.SMTP_USER || SMTP_USER;

  const mailOptions = {
    from: `"Library Management System" <${smtpFrom}>`,
    to: memberEmail,
    subject: `📚 Book Borrowed: ${bookTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #333;
            }
            .due-date {
              color: #e74c3c;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 Book Successfully Borrowed!</h1>
          </div>
          <div class="content">
            <p>Dear ${memberName || "Valued Member"},</p>
            
            <p>We're pleased to confirm that you have successfully borrowed a book from our library.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="label">Book Title:</span>
                <span class="value"><strong>${bookTitle}</strong></span>
              </div>
              <div class="info-row">
                <span class="label">Borrow ID:</span>
                <span class="value">${borrowId}</span>
              </div>
              <div class="info-row">
                <span class="label">Due Date:</span>
                <span class="value due-date">${dueDate}</span>
              </div>
            </div>
            
            <p><strong>Important Reminders:</strong></p>
            <ul>
              <li>Please return the book on or before the due date to avoid late fees.</li>
              <li>You can return the book through the library's return system.</li>
              <li>If you need to extend the borrowing period, please contact the library.</li>
            </ul>
            
            <p>Thank you for using our library services!</p>
            
            <div class="footer">
              <p>Library Management System</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Book Successfully Borrowed!

Dear ${memberName || "Valued Member"},

We're pleased to confirm that you have successfully borrowed a book from our library.

Book Details:
- Book Title: ${bookTitle}
- Borrow ID: ${borrowId}
- Due Date: ${dueDate}

Important Reminders:
- Please return the book on or before the due date to avoid late fees.
- You can return the book through the library's return system.
- If you need to extend the borrowing period, please contact the library.

Thank you for using our library services!

---
Library Management System
This is an automated email. Please do not reply.
    `
  };

  try {
    console.log(`[Email Service] Attempting to send email to: ${memberEmail}`);
    console.log(`[Email Service] SMTP From: ${SMTP_FROM}`);
    console.log(`[Email Service] SMTP Host: ${SMTP_HOST}:${SMTP_PORT}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] ✅ Book issued email sent successfully to ${memberEmail}`);
    console.log(`[Email Service] Message ID: ${info.messageId}`);
    console.log(`[Email Service] Response: ${JSON.stringify(info.response)}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] ❌ Failed to send email to ${memberEmail}`);
    console.error(`[Email Service] Error: ${error.message}`);
    console.error(`[Email Service] Error Code: ${error.code}`);
    console.error(`[Email Service] Full Error:`, error);
    return false;
  }
};

/*
  Send book returned email
  Sends a confirmation email when a book is returned.
  
  @param {Object} data - Event data containing return information
  @param {string} data.memberEmail - Email address of the borrower
  @param {string} data.memberName - Name of the borrower
  @param {string} data.bookTitle - Title of the returned book
  @param {string} data.returnDate - Date when the book was returned
  @param {boolean} data.wasOverdue - Whether the book was returned late
  @param {string} data.borrowId - Unique borrow record ID
*/
export const sendBookReturnedEmail = async (data) => {
  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    console.warn("[Email Service] Cannot send email - SMTP not configured");
    return false;
  }

  const { memberEmail, memberName, bookTitle, returnDate, wasOverdue, borrowId } = data;

  if (!memberEmail) {
    console.error("[Email Service] Cannot send email - member email not provided");
    return false;
  }

  // Get SMTP_FROM from environment
  const smtpFrom = process.env.SMTP_FROM || SMTP_FROM || process.env.SMTP_USER || SMTP_USER;
  
  const mailOptions = {
    from: `"Library Management System" <${smtpFrom}>`,
    to: memberEmail,
    subject: wasOverdue 
      ? `⚠️ Book Returned (Overdue): ${bookTitle}`
      : `✅ Book Returned: ${bookTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: ${wasOverdue 
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'};
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              border-left: 4px solid ${wasOverdue ? '#f5576c' : '#4facfe'};
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #333;
            }
            .overdue-notice {
              background: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              color: #856404;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${wasOverdue ? '⚠️ Book Returned (Overdue)' : '✅ Book Successfully Returned!'}</h1>
          </div>
          <div class="content">
            <p>Dear ${memberName || "Valued Member"},</p>
            
            <p>We have received your returned book. Thank you for returning it to our library.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="label">Book Title:</span>
                <span class="value"><strong>${bookTitle}</strong></span>
              </div>
              <div class="info-row">
                <span class="label">Borrow ID:</span>
                <span class="value">${borrowId}</span>
              </div>
              <div class="info-row">
                <span class="label">Return Date:</span>
                <span class="value">${returnDate}</span>
              </div>
            </div>
            
            ${wasOverdue ? `
              <div class="overdue-notice">
                <strong>⚠️ Overdue Notice:</strong>
                <p>This book was returned after the due date. Please check with the library regarding any applicable late fees.</p>
              </div>
            ` : `
              <p><strong>Thank you for returning the book on time!</strong></p>
            `}
            
            <p>We hope you enjoyed reading the book. Feel free to borrow more books from our collection!</p>
            
            <div class="footer">
              <p>Library Management System</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
${wasOverdue ? 'Book Returned (Overdue)' : 'Book Successfully Returned!'}

Dear ${memberName || "Valued Member"},

We have received your returned book. Thank you for returning it to our library.

Book Details:
- Book Title: ${bookTitle}
- Borrow ID: ${borrowId}
- Return Date: ${returnDate}

${wasOverdue ? `
⚠️ Overdue Notice:
This book was returned after the due date. Please check with the library regarding any applicable late fees.
` : `
Thank you for returning the book on time!
`}

We hope you enjoyed reading the book. Feel free to borrow more books from our collection!

---
Library Management System
This is an automated email. Please do not reply.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Book returned email sent to ${memberEmail}`);
    console.log(`[Email Service] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${memberEmail}:`, error.message);
    return false;
  }
};

/*
  Initialize email service on startup
*/
export const initializeEmailService = async () => {
  transporter = initializeTransporter();
  if (transporter) {
    await verifySMTPConnection();
  }
};

/*
  Send user deleted email
  Sends a notification email when a user account is deleted by admin.
  
  @param {Object} data - Event data containing user information
  @param {string} data.userEmail - Email address of the deleted user
  @param {string} data.username - Username of the deleted user
  @param {string} data.deletedBy - Who deleted the account (admin)
*/
export const sendUserDeletedEmail = async (data) => {
  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    console.warn("[Email Service] Cannot send email - SMTP not configured");
    return false;
  }

  const { userEmail, username, deletedBy } = data;

  if (!userEmail) {
    console.error("[Email Service] Cannot send email - user email not provided");
    return false;
  }

  // Get SMTP_FROM from environment dynamically
  const smtpFrom = process.env.SMTP_FROM || SMTP_FROM || process.env.SMTP_USER || SMTP_USER;

  const mailOptions = {
    from: `"Library Management System" <${smtpFrom}>`,
    to: userEmail,
    subject: `⚠️ Account Deleted: Library Management System`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              border-left: 4px solid #ff6b6b;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #333;
            }
            .notice {
              background: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              color: #856404;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚠️ Account Deleted</h1>
          </div>
          <div class="content">
            <p>Dear ${username || "User"},</p>
            
            <p>We regret to inform you that your account on the Library Management System has been deleted by an administrator.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="label">Username:</span>
                <span class="value"><strong>${username}</strong></span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${userEmail}</span>
              </div>
              <div class="info-row">
                <span class="label">Deletion Date:</span>
                <span class="value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div class="notice">
              <strong>⚠️ Important Notice:</strong>
              <p>If you believe this was done in error, please contact the library administrator immediately.</p>
            </div>
            
            <p>Thank you for being a part of our library community.</p>
            
            <div class="footer">
              <p>Library Management System</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Account Deleted - Library Management System

Dear ${username || "User"},

We regret to inform you that your account on the Library Management System has been deleted by an administrator.

Account Details:
- Username: ${username}
- Email: ${userEmail}
- Deletion Date: ${new Date().toLocaleDateString()}

⚠️ Important Notice:
If you believe this was done in error, please contact the library administrator immediately.

Thank you for being a part of our library community.

---
Library Management System
This is an automated email. Please do not reply.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] User deleted email sent to ${userEmail}`);
    console.log(`[Email Service] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${userEmail}:`, error.message);
    return false;
  }
};

/*
  Send new book notification email
  Sends a notification email when a new book is added in a subscribed category.
  
  @param {Object} data - Data containing book and user information
  @param {string} data.userEmail - Email address of the subscriber
  @param {string} data.userName - Name of the subscriber
  @param {string} data.bookTitle - Title of the new book
  @param {string} data.bookAuthor - Author of the new book
  @param {string} data.bookCategory - Category of the book
  @param {string} data.coverImageUrl - Cover image URL
  @param {string} data.subscriptionType - Type of subscription (category/book/both)
*/
export const sendNewBookNotificationEmail = async (data) => {
  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    console.warn("[Email Service] Cannot send email - SMTP not configured");
    return false;
  }

  const { userEmail, userName, bookTitle, bookAuthor, bookCategory, coverImageUrl, subscriptionType } = data;

  if (!userEmail) {
    console.error("[Email Service] Cannot send email - user email not provided");
    return false;
  }

  // Get SMTP_FROM from environment
  const smtpFrom = process.env.SMTP_FROM || SMTP_FROM || process.env.SMTP_USER || SMTP_USER;

  const subscriptionMessage = subscriptionType === 'both'
    ? `You're receiving this because you've subscribed to both the "${bookCategory}" category and this book.`
    : subscriptionType === 'book'
    ? `You're receiving this because you've subscribed to notifications about this book.`
    : `You're receiving this because you've subscribed to the "${bookCategory}" category.`;

  const mailOptions = {
    from: `"Library Management System" <${smtpFrom}>`,
    to: userEmail,
    subject: `📚 New Book Added: ${bookTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .book-card {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              display: flex;
              align-items: flex-start;
              gap: 20px;
            }
            .book-cover {
              width: 120px;
              height: 180px;
              object-fit: cover;
              border-radius: 4px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .book-info h3 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .book-info p {
              margin: 5px 0;
              color: #666;
            }
            .category-badge {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              margin-top: 10px;
            }
            .subscription-note {
              background: #e8f4fd;
              border-left: 4px solid #2196F3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
              color: #1565C0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 New Book Added!</h1>
          </div>
          <div class="content">
            <p>Dear ${userName || "Subscriber"},</p>
            
            <p>Great news! A new book has been added to the library that matches your subscription preferences.</p>
            
            <div class="book-card">
              ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${bookTitle}" class="book-cover">` : ''}
              <div class="book-info">
                <h3>${bookTitle}</h3>
                <p><strong>Author:</strong> ${bookAuthor}</p>
                <span class="category-badge">${bookCategory}</span>
              </div>
            </div>
            
            <div class="subscription-note">
              <strong>ℹ️ Subscription Info:</strong><br>
              ${subscriptionMessage}
            </div>
            
            <p>Don't miss out! Visit the library to check out this new addition.</p>
            
            <div class="footer">
              <p>Library Management System</p>
              <p>To manage your subscriptions, visit your dashboard.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Book Added - Library Management System

Dear ${userName || "Subscriber"},

Great news! A new book has been added to the library that matches your subscription preferences.

Book Details:
- Title: ${bookTitle}
- Author: ${bookAuthor}
- Category: ${bookCategory}

${subscriptionMessage}

Don't miss out! Visit the library to check out this new addition.

---
Library Management System
To manage your subscriptions, visit your dashboard.
This is an automated email. Please do not reply.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] New book notification email sent to ${userEmail}`);
    console.log(`[Email Service] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${userEmail}:`, error.message);
    return false;
  }
};