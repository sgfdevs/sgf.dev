using DataAnnotationsExtensions;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SgfDevs.Models
{
    public class ResetPasswordModel
    {
        [DisplayName("Email address")]
        [Required(ErrorMessage = "Please enter your email address")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        public string EmailAddress { get; set; }

        [UIHint("Password")]
        [Required(ErrorMessage = "Please enter your password")]
        public string Password { get; set; }

        [UIHint("Password")]
        [DisplayName("Confirm Password")]
        [Required(ErrorMessage = "Please confirm your password")]
        [EqualTo("Password", ErrorMessage = "Your passwords do not match")]
        public string ConfirmPassword { get; set; }
    }
}