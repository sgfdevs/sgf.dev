using System.ComponentModel.DataAnnotations;

namespace SGFDevs.Models;

public class RegisterModel
{
    [Required]
    [Display(Name = "First Name")]
    public string FirstName { get; set; }

    [Required]
    [Display(Name = "Last Name")]
    public string LastName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [RegularExpression("^[a-zA-Z0-9]*$", ErrorMessage = "Only alpha numeric characters allowed.")]
    public string Username { get; set; }

    [Required]
    [DataType(DataType.Password)]
    [RegularExpression(PasswordValidationRules.Pattern, ErrorMessage = PasswordValidationRules.ErrorMessage)]
    public string Password { get; set; }

    [Required]
    [Display(Name = "Null Check")]
    [RegularExpression("SGF|sgf", ErrorMessage = "Better luck next time.")]
    public string ChallengeQuestion { get; set; }
}
