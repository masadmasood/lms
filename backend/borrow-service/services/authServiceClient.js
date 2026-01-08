/*
  Auth Service Client
  
  This module handles HTTP communication with the Auth Service.
  It verifies if an email exists in the auth service (users database).
  
  The Borrow Service calls this to verify that the email provided
  during borrowing exists in the auth service users database.
*/

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3000";

/*
  Verify email exists in auth service
  Checks if the email is registered in the auth service.
  Returns true if found, throws error if not found.
*/
export const verifyEmail = async (email) => {
  try {
    // Use login endpoint with a dummy password to check if email exists
    // If user not found, auth service will return 404
    // We just need to check if email exists, not actual login
    
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        loginId: email,
        password: "CHECK_EMAIL_EXISTS" // Dummy password - we just want to verify email exists
      })
    });
    
    const data = await response.json();
    
    // If status is 404, email doesn't exist
    if (response.status === 404) {
      throw new Error("Email not found in system. Only registered users can borrow books.");
    }
    
    // If status is 401 (invalid credentials), email EXISTS but password wrong
    // This means email is valid, so we return success
    if (response.status === 401) {
      return { success: true, message: "Email verified" };
    }
    
    // If status is 200, email exists and somehow password matched (unlikely)
    if (response.ok) {
      return { success: true, message: "Email verified" };
    }
    
    // Any other error
    throw new Error(data.message || "Email verification failed");
    
  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") {
      throw new Error("Auth Service is unavailable");
    }
    throw error;
  }
};

export default { verifyEmail };

