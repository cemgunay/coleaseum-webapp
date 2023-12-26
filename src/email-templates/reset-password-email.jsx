export const ResetPasswordEmailTemplate = ({ email, resetPasswordToken }) => (
    <div>
        <h1>Reset password for <b>{email}</b></h1>
        <p>
            To reset your password, click on this link and follow the instructions:
        </p>
        <a href={`http://localhost:3000/auth/reset-password?token=${resetPasswordToken}`}>
            Click here to reset password
        </a>
    </div>
);
