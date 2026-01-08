/*
  Subscription Controller
  
  Handles all subscription-related operations:
  - Subscribe/Unsubscribe to categories
  - Subscribe/Unsubscribe to books
  - Get user subscriptions
  - Get category/book subscribers (for notification targeting)
*/

import CategorySubscription from "../models/CategorySubscription.js";
import BookSubscription from "../models/BookSubscription.js";

/*
  Subscribe to a category
*/
export const subscribeToCategory = async (req, res) => {
  try {
    const { userId, userEmail, userName, categoryId, categoryName } = req.body;

    if (!userId || !userEmail || !categoryId || !categoryName) {
      return res.status(400).json({
        success: false,
        error: "userId, userEmail, categoryId, and categoryName are required"
      });
    }

    // Check if already subscribed
    const existing = await CategorySubscription.findOne({ userId, categoryId });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          error: "Already subscribed to this category"
        });
      }
      // Reactivate subscription
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Subscription reactivated",
        data: existing
      });
    }

    const subscription = new CategorySubscription({
      userId,
      userEmail,
      userName: userName || '',
      categoryId,
      categoryName
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to category",
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Unsubscribe from a category
*/
export const unsubscribeFromCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.body;

    if (!userId || !categoryId) {
      return res.status(400).json({
        success: false,
        error: "userId and categoryId are required"
      });
    }

    const subscription = await CategorySubscription.findOne({ userId, categoryId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }

    // Soft delete - set isActive to false
    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from category",
      data: { categoryId, categoryName: subscription.categoryName }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Subscribe to a book
*/
export const subscribeToBook = async (req, res) => {
  try {
    const { userId, userEmail, userName, bookId, bookTitle, bookCategory } = req.body;

    if (!userId || !userEmail || !bookId || !bookTitle) {
      return res.status(400).json({
        success: false,
        error: "userId, userEmail, bookId, and bookTitle are required"
      });
    }

    // Check if already subscribed
    const existing = await BookSubscription.findOne({ userId, bookId });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          error: "Already subscribed to this book"
        });
      }
      // Reactivate subscription
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Subscription reactivated",
        data: existing
      });
    }

    const subscription = new BookSubscription({
      userId,
      userEmail,
      userName: userName || '',
      bookId,
      bookTitle,
      bookCategory: bookCategory || ''
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to book",
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Unsubscribe from a book
*/
export const unsubscribeFromBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        error: "userId and bookId are required"
      });
    }

    const subscription = await BookSubscription.findOne({ userId, bookId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }

    // Soft delete - set isActive to false
    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from book",
      data: { bookId, bookTitle: subscription.bookTitle }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get all subscriptions for a user
*/
export const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required"
      });
    }

    const [categorySubscriptions, bookSubscriptions] = await Promise.all([
      CategorySubscription.find({ userId, isActive: true }).sort({ subscribedAt: -1 }),
      BookSubscription.find({ userId, isActive: true }).sort({ subscribedAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories: categorySubscriptions,
        books: bookSubscriptions,
        totalCategories: categorySubscriptions.length,
        totalBooks: bookSubscriptions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Check if user is subscribed to a category
*/
export const checkCategorySubscription = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;

    const subscription = await CategorySubscription.findOne({ 
      userId, 
      categoryId, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        isSubscribed: !!subscription,
        subscription: subscription || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Check if user is subscribed to a book
*/
export const checkBookSubscription = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const subscription = await BookSubscription.findOne({ 
      userId, 
      bookId, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        isSubscribed: !!subscription,
        subscription: subscription || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get all subscribers of a category (for notification targeting)
*/
export const getCategorySubscribers = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { categoryName } = req.query;

    // Search by categoryId or categoryName (case-insensitive)
    const query = { isActive: true };
    if (categoryId) {
      query.$or = [
        { categoryId },
        { categoryName: { $regex: new RegExp(`^${categoryName || categoryId}$`, 'i') } }
      ];
    }

    const subscribers = await CategorySubscription.find(query);

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get all subscribers of a book (for notification targeting)
*/
export const getBookSubscribers = async (req, res) => {
  try {
    const { bookId } = req.params;

    const subscribers = await BookSubscription.find({ 
      bookId, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/*
  Get subscribers for notification (with deduplication)
  Used when creating notifications - ensures a user doesn't get duplicate notifications
  if they're subscribed to both a category and a specific book in that category.
*/
export const getTargetedSubscribers = async (categoryName, bookId = null) => {
  try {
    const subscribers = new Map(); // Use Map for deduplication by userId

    // Get category subscribers
    const categorySubscribers = await CategorySubscription.find({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      isActive: true
    });

    categorySubscribers.forEach(sub => {
      subscribers.set(sub.userId, {
        userId: sub.userId,
        userEmail: sub.userEmail,
        userName: sub.userName,
        subscriptionType: 'category',
        categoryId: sub.categoryId,
        categoryName: sub.categoryName
      });
    });

    // Get book subscribers (if bookId provided)
    if (bookId) {
      const bookSubscribers = await BookSubscription.find({
        bookId,
        isActive: true
      });

      bookSubscribers.forEach(sub => {
        // If user already in map (from category), mark as both
        if (subscribers.has(sub.userId)) {
          const existing = subscribers.get(sub.userId);
          existing.subscriptionType = 'both';
          existing.bookId = sub.bookId;
          existing.bookTitle = sub.bookTitle;
        } else {
          subscribers.set(sub.userId, {
            userId: sub.userId,
            userEmail: sub.userEmail,
            userName: sub.userName,
            subscriptionType: 'book',
            bookId: sub.bookId,
            bookTitle: sub.bookTitle
          });
        }
      });
    }

    return Array.from(subscribers.values());
  } catch (error) {
    console.error('[Subscription Controller] Error getting targeted subscribers:', error.message);
    return [];
  }
};
