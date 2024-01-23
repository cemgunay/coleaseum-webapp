export const VerifyEmailTemplate = ({ email, emailVerificationToken }) => (
    <div>
      <h1>Verify email for: {email}<b/></h1>
      <p>
        To verify your email please click link below
      </p>
      <a href={`http://localhost:3000/auth/verify-email?token=${emailVerificationToken}`}>
        Click here to verify your email
      </a>
    </div>
  );