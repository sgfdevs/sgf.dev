namespace SGFDevs.Models;

public static class PasswordValidationRules
{
    public const string Pattern = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$";
    public const string ErrorMessage = "You know the drill.. Password must contain at least one upper and lowercase letter, a numeric digit, a special character, and be at least 8 characters long.";
}
