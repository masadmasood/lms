/*
  Event Handlers
  
  This module contains handlers for each type of event the Notification
  Service is interested in.
  
  Design Principle:
  - Handlers are pure functions that process events
  - They contain NO business logic (that belongs in Borrow Service)
  - They react to events that have already happened
  - They don't affect the outcome of the original operation
  
  This service:
  - Sends actual emails via SMTP (Gmail)
  - Handles multiple users borrowing the same book (each gets separate email)
  - Logs events for audit purposes
  
  This service can be extended to:
  - Send due date reminders
  - Send overdue notices
  - Generate weekly reading summaries
  - Feed analytics dashboards
  - Push mobile notifications
*/

import { sendBookIssuedEmail, sendBookReturnedEmail, sendUserDeletedEmail, sendNewBookNotificationEmail } from "./emailService.js";
import { getTargetedSubscribers } from "../controllers/subscriptionController.js";
import { createBatchNotifications } from "../controllers/notificationDbController.js";

/*
  In-memory event log for demonstration
  In production, this would be a database or log aggregation service.
*/
const eventLog = [];

/*
  Get all logged events
  Used by the REST API to display event history.
*/
export const getEventLog = () => eventLog;

/*
  Handle BOOK_ISSUED event
  
  Triggered when a member successfully borrows a book.
  
  This handler:
  - Sends confirmation email to the member
  - Logs the event for audit purposes
  - Handles multiple users borrowing the same book (each gets their own email)
*/
export const handleBookIssued = async (event) => {
  const { data, timestamp } = event;
  
  // Prepare email data
  // Handle both 'email' and 'memberEmail' fields for compatibility
  const memberEmail = data.memberEmail || data.email;
  const memberName = data.memberName || data.borrowerName;
  
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           📚 BOOK ISSUED NOTIFICATION                    ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Borrow ID:  ${data.borrowId}`);
  console.log(`║  Member:     ${memberName} (${memberEmail || data.memberId})`);
  console.log(`║  Book:       ${data.bookTitle}`);
  console.log(`║  Due Date:   ${data.dueDate}`);
  console.log(`║  Timestamp:  ${timestamp}`);
  console.log("╠══════════════════════════════════════════════════════════╣");
  
  // Debug: Log email field availability
  console.log(`[DEBUG] Email fields - memberEmail: ${data.memberEmail}, email: ${data.email}`);
  console.log(`[DEBUG] Resolved email: ${memberEmail}`);
  
  if (!memberEmail) {
    console.error("║  ❌ ERROR: No email address found in event data!        ║");
    console.error("║  Event data keys: " + Object.keys(data).join(", ") + " ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    return;
  }
  
  const emailData = {
    memberEmail: memberEmail,
    memberName: memberName,
    bookTitle: data.bookTitle,
    dueDate: data.dueDate,
    borrowId: data.borrowId
  };
  
  // Send email to the member
  console.log(`[DEBUG] Attempting to send email to: ${memberEmail}`);
  const emailSent = await sendBookIssuedEmail(emailData);
  
  if (emailSent) {
    console.log(`║  ✅ Email sent to ${emailData.memberEmail}              ║`);
  } else {
    console.log(`║  ⚠️  Failed to send email to ${emailData.memberEmail}    ║`);
  }
  
  console.log("╚══════════════════════════════════════════════════════════╝");
  
  /*
    Log the event for audit
  */
  eventLog.push({
    id: `log-${Date.now()}`,
    eventType: "BOOK_ISSUED",
    receivedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
    data: data,
    emailSent: emailSent,
    emailRecipient: emailData.memberEmail,
    actions: [
      emailSent ? `Email confirmation sent to ${emailData.memberEmail}` : `Failed to send email to ${emailData.memberEmail}`,
      "Event logged for audit"
    ]
  });
  
  console.log("[Event Handler] BOOK_ISSUED event processed successfully\n");
};

/*
  Handle BOOK_RETURNED event
  
  Triggered when a member returns a borrowed book.
  
  This handler:
  - Sends thank you email (or overdue notice if applicable)
  - Logs the event for audit purposes
*/
export const handleBookReturned = async (event) => {
  const { data, timestamp } = event;
  
  // Prepare email data
  // Handle both 'email' and 'memberEmail' fields for compatibility
  const memberEmail = data.memberEmail || data.email;
  const memberName = data.memberName || data.borrowerName;
  
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           📖 BOOK RETURNED NOTIFICATION                  ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Borrow ID:  ${data.borrowId}`);
  console.log(`║  Member:     ${memberName} (${memberEmail || data.memberId})`);
  console.log(`║  Book:       ${data.bookTitle}`);
  console.log(`║  Returned:   ${data.returnDate}`);
  console.log(`║  Was Overdue: ${data.wasOverdue ? "Yes ⚠️" : "No ✅"}`);
  console.log(`║  Timestamp:  ${timestamp}`);
  console.log("╠══════════════════════════════════════════════════════════╣");
  
  const emailData = {
    memberEmail: memberEmail,
    memberName: memberName,
    bookTitle: data.bookTitle,
    returnDate: data.returnDate,
    wasOverdue: data.wasOverdue || false,
    borrowId: data.borrowId
  };
  
  // Send email to the member
  const emailSent = await sendBookReturnedEmail(emailData);
  
  if (emailSent) {
    if (data.wasOverdue) {
      console.log(`║  ✅ Overdue notice sent to ${emailData.memberEmail}      ║`);
    } else {
      console.log(`║  ✅ Thank you email sent to ${emailData.memberEmail}       ║`);
    }
  } else {
    console.log(`║  ⚠️  Failed to send email to ${emailData.memberEmail}    ║`);
  }
  
  console.log("╚══════════════════════════════════════════════════════════╝");
  
  /*
    Log the event for audit
  */
  const actions = data.wasOverdue 
    ? [
        emailSent ? `Overdue notice sent to ${emailData.memberEmail}` : `Failed to send overdue notice to ${emailData.memberEmail}`,
        "Event logged for audit"
      ]
    : [
        emailSent ? `Thank you email sent to ${emailData.memberEmail}` : `Failed to send thank you email to ${emailData.memberEmail}`,
        "Event logged for audit"
      ];
  
  eventLog.push({
    id: `log-${Date.now()}`,
    eventType: "BOOK_RETURNED",
    receivedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
    data: data,
    wasOverdue: data.wasOverdue,
    emailSent: emailSent,
    emailRecipient: emailData.memberEmail,
    actions: actions
  });
  
  console.log("[Event Handler] BOOK_RETURNED event processed successfully\n");
};

/*
  Handle USER_DELETED event
  
  Triggered when an admin deletes a student account.
  
  This handler:
  - Sends notification email to the user about account deletion
  - Logs the event for audit purposes
*/
export const handleUserDeleted = async (event) => {
  const { data, timestamp } = event;
  
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           🗑️ USER DELETED NOTIFICATION                   ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  User ID:    ${data.userId}`);
  console.log(`║  Username:   ${data.username}`);
  console.log(`║  Email:      ${data.email}`);
  console.log(`║  Deleted By: ${data.deletedBy}`);
  console.log(`║  Timestamp:  ${timestamp}`);
  console.log("╠══════════════════════════════════════════════════════════╣");
  
  if (!data.email) {
    console.error("║  ❌ ERROR: No email address found in event data!        ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    return;
  }
  
  const emailData = {
    userEmail: data.email,
    username: data.username,
    deletedBy: data.deletedBy
  };
  
  // Send email to the user
  const emailSent = await sendUserDeletedEmail(emailData);
  
  if (emailSent) {
    console.log(`║  ✅ Deletion notice sent to ${data.email}              ║`);
  } else {
    console.log(`║  ⚠️  Failed to send email to ${data.email}             ║`);
  }
  
  console.log("╚══════════════════════════════════════════════════════════╝");
  
  /*
    Log the event for audit
  */
  eventLog.push({
    id: `log-${Date.now()}`,
    eventType: "USER_DELETED",
    receivedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
    data: data,
    emailSent: emailSent,
    emailRecipient: data.email,
    actions: [
      emailSent ? `Account deletion notice sent to ${data.email}` : `Failed to send deletion notice to ${data.email}`,
      "Event logged for audit"
    ]
  });
  
  console.log("[Event Handler] USER_DELETED event processed successfully\n");
};

/*
  Handle BOOK_ADDED event
  
  Triggered when an admin adds a new book to the catalog.
  
  This handler:
  - Gets all subscribers of the book's category (deduplicated)
  - Creates notifications for each subscriber in database
  - Sends email notifications to subscribers
  - Logs the event for audit purposes
*/
export const handleBookAdded = async (event) => {
  const { data, timestamp } = event;
  
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           📚 NEW BOOK ADDED NOTIFICATION                 ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Book ID:    ${data.bookId}`);
  console.log(`║  Title:      ${data.title}`);
  console.log(`║  Author:     ${data.author}`);
  console.log(`║  Category:   ${data.category}`);
  console.log(`║  Timestamp:  ${timestamp}`);
  console.log("╠══════════════════════════════════════════════════════════╣");
  
  try {
    // Get all subscribers for this category (with deduplication)
    const subscribers = await getTargetedSubscribers(data.category, data.bookId);
    
    console.log(`║  Subscribers found: ${subscribers.length}                              `);
    
    if (subscribers.length === 0) {
      console.log("║  No subscribers to notify                                ║");
      console.log("╚══════════════════════════════════════════════════════════╝");
      
      eventLog.push({
        id: `log-${Date.now()}`,
        eventType: "BOOK_ADDED",
        receivedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        data: data,
        subscribersNotified: 0,
        actions: ["No subscribers to notify"]
      });
      return;
    }
    
    // Create notifications in database for all subscribers
    const notificationData = {
      type: 'BOOK_ADDED',
      title: `New Book: ${data.title}`,
      message: `A new book "${data.title}" by ${data.author} has been added to the ${data.category} category.`,
      relatedBookId: data.bookId,
      relatedBookTitle: data.title,
      relatedCategoryName: data.category,
      metadata: {
        author: data.author,
        coverImageUrl: data.coverImageUrl
      },
      priority: 'normal'
    };
    
    await createBatchNotifications(subscribers, notificationData);
    
    // Send email to each subscriber
    let emailsSent = 0;
    for (const subscriber of subscribers) {
      const emailSent = await sendNewBookNotificationEmail({
        userEmail: subscriber.userEmail,
        userName: subscriber.userName,
        bookTitle: data.title,
        bookAuthor: data.author,
        bookCategory: data.category,
        coverImageUrl: data.coverImageUrl,
        subscriptionType: subscriber.subscriptionType
      });
      
      if (emailSent) {
        emailsSent++;
        console.log(`║  ✅ Email sent to ${subscriber.userEmail}`);
      } else {
        console.log(`║  ⚠️  Failed to send email to ${subscriber.userEmail}`);
      }
    }
    
    console.log(`║                                                          ║`);
    console.log(`║  Total Notifications: ${subscribers.length}                              `);
    console.log(`║  Emails Sent: ${emailsSent}/${subscribers.length}                                    `);
    console.log("╚══════════════════════════════════════════════════════════╝");
    
    eventLog.push({
      id: `log-${Date.now()}`,
      eventType: "BOOK_ADDED",
      receivedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      data: data,
      subscribersNotified: subscribers.length,
      emailsSent: emailsSent,
      actions: [
        `${subscribers.length} in-app notifications created`,
        `${emailsSent}/${subscribers.length} emails sent`,
        "Event logged for audit"
      ]
    });
    
  } catch (error) {
    console.error("║  ❌ ERROR processing BOOK_ADDED event:", error.message);
    console.log("╚══════════════════════════════════════════════════════════╝");
    
    eventLog.push({
      id: `log-${Date.now()}`,
      eventType: "BOOK_ADDED",
      receivedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      data: data,
      error: error.message,
      actions: ["Error processing event"]
    });
  }
  
  console.log("[Event Handler] BOOK_ADDED event processed successfully\n");
};

/*
  Handle BOOK_UPDATED event
  
  Triggered when an admin updates a book in the catalog.
  Notifies users who have subscribed to this specific book.
*/
export const handleBookUpdated = async (event) => {
  const { data, timestamp } = event;
  
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           📝 BOOK UPDATED NOTIFICATION                   ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Book ID:    ${data.bookId}`);
  console.log(`║  Title:      ${data.title}`);
  console.log(`║  Author:     ${data.author}`);
  console.log(`║  Timestamp:  ${timestamp}`);
  console.log("╠══════════════════════════════════════════════════════════╣");
  
  try {
    // Get subscribers of this specific book
    const subscribers = await getTargetedSubscribers(data.category || '', data.bookId);
    
    // Filter to only book-specific subscribers for updates
    const bookSubscribers = subscribers.filter(s => 
      s.subscriptionType === 'book' || s.subscriptionType === 'both'
    );
    
    console.log(`║  Book Subscribers found: ${bookSubscribers.length}                          `);
    
    if (bookSubscribers.length === 0) {
      console.log("║  No book subscribers to notify                          ║");
      console.log("╚══════════════════════════════════════════════════════════╝");
      return;
    }
    
    // Create notifications in database
    const notificationData = {
      type: 'BOOK_UPDATED',
      title: `Book Updated: ${data.title}`,
      message: `The book "${data.title}" that you're following has been updated.`,
      relatedBookId: data.bookId,
      relatedBookTitle: data.title,
      priority: 'low'
    };
    
    await createBatchNotifications(bookSubscribers, notificationData);
    
    console.log(`║  Notifications created: ${bookSubscribers.length}                          `);
    console.log("╚══════════════════════════════════════════════════════════╝");
    
    eventLog.push({
      id: `log-${Date.now()}`,
      eventType: "BOOK_UPDATED",
      receivedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      data: data,
      subscribersNotified: bookSubscribers.length,
      actions: [`${bookSubscribers.length} notifications created`]
    });
    
  } catch (error) {
    console.error("║  ❌ ERROR processing BOOK_UPDATED event:", error.message);
    console.log("╚══════════════════════════════════════════════════════════╝");
  }
  
  console.log("[Event Handler] BOOK_UPDATED event processed successfully\n");
};
