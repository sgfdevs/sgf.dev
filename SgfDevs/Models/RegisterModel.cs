using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SgfDevs.Models
{
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
        [RegularExpression("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$", ErrorMessage ="You know the drill.. Password must contain at least one upper and lowercase letter, a numeric digit, a special character, and be at least 8 characters long.")]
        public string Password { get; set; }

        [Required]
        [Display(Name = "Null Check")]
        [RegularExpression("SGF|sgf", ErrorMessage = "Better luck next time.")]
        public string ChallengeQuestion { get; set; }
    }
}