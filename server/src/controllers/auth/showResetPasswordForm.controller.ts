import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User from "../../models/User.js";

export const showResetPasswordForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resetToken } = req.params;

    // Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken!)
      .digest("hex");

    // Find user
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // If token invalid or expired
    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Reset Password Failed</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
                width: 90%;
              }
              .icon { font-size: 60px; margin-bottom: 20px; }
              h1 { color: #e74c3c; margin-bottom: 20px; font-size: 24px; }
              p { color: #555; line-height: 1.6; margin-bottom: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>Password Reset Failed</h1>
              <p>This reset link is invalid or has expired.</p>
              <p>Reset links expire after 10 minutes for security reasons.</p>
              <p>Please request a new password reset link.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Show reset form
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reset Password</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
              max-width: 450px;
              width: 100%;
            }
            .header { text-align: center; margin-bottom: 30px; }
            .icon { font-size: 50px; margin-bottom: 15px; }
            h1 { color: #333; margin-bottom: 10px; font-size: 24px; }
            .subtitle { color: #666; font-size: 14px; }
            .form-group { margin-bottom: 20px; }
            label {
              display: block;
              margin-bottom: 8px;
              color: #333;
              font-weight: 500;
            }
            input[type="password"] {
              width: 100%;
              padding: 12px;
              border: 2px solid #ddd;
              border-radius: 6px;
              font-size: 16px;
              transition: border-color 0.3s;
            }
            input[type="password"]:focus {
              outline: none;
              border-color: #667eea;
            }
            .password-requirements {
              margin-top: 8px;
              padding: 12px;
              background: #f8f9fa;
              border-radius: 6px;
              font-size: 13px;
              color: #666;
            }
            .password-requirements ul {
              margin-left: 20px;
              margin-top: 8px;
            }
            .password-requirements li { margin: 4px 0; }
            button {
              width: 100%;
              padding: 14px;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.3s;
            }
            button:hover { background: #5568d3; }
            button:disabled {
              background: #ccc;
              cursor: not-allowed;
            }
            .error {
              color: #e74c3c;
              font-size: 14px;
              margin-top: 10px;
              display: none;
            }
            .success {
              color: #27ae60;
              font-size: 14px;
              margin-top: 10px;
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🔑</div>
              <h1>Reset Your Password</h1>
              <p class="subtitle">Enter your new password below</p>
            </div>

            <form id="resetForm">
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  placeholder="Enter new password"
                  required
                  minlength="8"
                />
                <div class="password-requirements">
                  <strong>Password must contain:</strong>
                  <ul>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  placeholder="Confirm new password"
                  required
                  minlength="8"
                />
              </div>

              <button type="submit" id="submitBtn">Reset Password</button>
              
              <div class="error" id="errorMsg"></div>
              <div class="success" id="successMsg"></div>
            </form>
          </div>

          <script>
            const form = document.getElementById('resetForm');
            const submitBtn = document.getElementById('submitBtn');
            const errorMsg = document.getElementById('errorMsg');
            const successMsg = document.getElementById('successMsg');
            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');

            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              console.log('Form submitted!');
              
              errorMsg.style.display = 'none';
              successMsg.style.display = 'none';

              const newPassword = newPasswordInput.value;
              const confirmPassword = confirmPasswordInput.value;

              console.log('Password length:', newPassword.length);

              if (newPassword !== confirmPassword) {
                console.log('Passwords do not match!');
                errorMsg.textContent = 'Passwords do not match!';
                errorMsg.style.display = 'block';
                return;
              }
              console.log('Passwords match!');

             
              const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$/;
              
              console.log('Testing password requirements:');
              console.log('  - Has lowercase:', /[a-z]/.test(newPassword));
              console.log('  - Has uppercase:', /[A-Z]/.test(newPassword));
              console.log('  - Has digit:', /\\d/.test(newPassword));
              console.log('  - Has special:', /[@$!%*?&]/.test(newPassword));
              console.log('  - Length >= 8:', newPassword.length >= 8);
              
              if (!passwordRegex.test(newPassword)) {
                console.log('Password does not meet requirements!');
                errorMsg.textContent = 'Password must have: uppercase, lowercase, number, special char (@$!%*?&), min 8 chars';
                errorMsg.style.display = 'block';
                return;
              }
              console.log('Password meets requirements!');

              submitBtn.disabled = true;
              submitBtn.textContent = 'Resetting...';

              console.log('Sending POST to:', window.location.href);

              try {
                const response = await fetch(window.location.href, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ newPassword }),
                });

                console.log('Response status:', response.status);
                
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok) {
                  console.log('Password reset successful!');
                  successMsg.textContent = 'Password reset successfully!';
                  successMsg.style.display = 'block';
                  form.style.display = 'none';
                  
                  setTimeout(() => {
                    alert('Password reset successful! You can now login with your new password.');
                  }, 1500);
                } else {
                  console.log('Failed:', data.message);
                  errorMsg.textContent = data.message || 'Failed to reset password.';
                  errorMsg.style.display = 'block';
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Reset Password';
                }
              } catch (error) {
                console.log('Network error:', error);
                errorMsg.textContent = 'Network error. Please try again.';
                errorMsg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset Password';
              }
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};
