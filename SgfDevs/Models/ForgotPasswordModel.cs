using System.ComponentModel.DataAnnotations;

namespace SGFDevs.Models;

public class ForgotPasswordModel
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
}
