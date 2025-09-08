
export const verifyemail = ({
  otp,
  title,
}: {
  otp: number;
  title: string;
}): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">${title}</h2>
      <p>Thank you for registering. Please use the following OTP to verify your email:</p>
      <div style="font-size: 22px; font-weight: bold; margin: 20px 0; color: #000;">
        ${otp}
      </div>
      <p>This OTP will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      <br/>
      <p style="color:#777;">Best regards,<br/>Your App Team</p>
    </div>
  `;
};
