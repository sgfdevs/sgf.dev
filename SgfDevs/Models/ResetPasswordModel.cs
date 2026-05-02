using System.ComponentModel.DataAnnotations;

namespace SGFDevs.Models;

public class ResetPasswordModel
{
    [Required]
    public string MemberId { get; set; }

    [Required]
    public string Token { get; set; }

    [Required]
    [DataType(DataType.Password)]
    [RegularExpression(PasswordValidationRules.Pattern, ErrorMessage = PasswordValidationRules.ErrorMessage)]
    public string Password { get; set; }

    [Required]
    [DataType(DataType.Password)]
    [Compare(nameof(Password), ErrorMessage = "Passwords do not match.")]
    [Display(Name = "Confirm Password")]
    public string ConfirmPassword { get; set; }
}
