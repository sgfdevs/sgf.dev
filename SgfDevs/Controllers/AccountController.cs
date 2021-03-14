using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web.Mvc;
using System.Web.Mvc;
using SgfDevs.Models;
using SgfDevs.ViewModels;
using System.Net.Mail;
using SgfDevs.Dev;
using Umbraco.Web.Composing;

namespace SgfDevs.Controllers
{
    public class AccountController : SurfaceController
    {

        public ActionResult Login(LoginModel model)
        {
            if (!ModelState.IsValid)
                return CurrentUmbracoPage();

            if (Members.Login(model.Username, model.Password))
                return Redirect("/");

            ModelState.AddModelError("", "Invalid Login");

            return CurrentUmbracoPage();
        }

        public ActionResult Register(RegisterModel model)
        {
            if (!ModelState.IsValid)
                return CurrentUmbracoPage();

            var memberService = Services.MemberService;
            //var memberGroupService = Services.MemberGroupService;
            //var memberGroup = memberGroupService.GetByName("Member");

            if (memberService.GetByEmail(model.Email) != null)
            {
                ModelState.AddModelError("", "A member with that email already exists.");
                return CurrentUmbracoPage();
            }

            if (memberService.GetByUsername(model.Username) != null)
            {
                ModelState.AddModelError("", "Ope. This username is already taken.");
                return CurrentUmbracoPage();
            }

            var fullName = model.FirstName + " " + model.LastName;

            var member = memberService.CreateMemberWithIdentity(model.Username, model.Email, fullName, "Member");

            try
            {
                memberService.SavePassword(member, model.Password);
            }
            catch (Exception e)
            {
                ModelState.AddModelError("", "Password too weak");
                return CurrentUmbracoPage();
            }

            memberService.AssignRole(member.Id, "SGF Devs");

            member.SetValue("FirstName", model.FirstName);
            member.SetValue("LastName", model.LastName);
            member.SetValue("Username", model.Username);
            memberService.Save(member);

            Members.Login(model.Username, model.Password);

            return Redirect("/account");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult HandleForgottenPassword(ForgottenPasswordModel model)
        {
            if (!ModelState.IsValid)
                return CurrentUmbracoPage();

            var memberService = Services.MemberService;
            //Find the member with the email address
            var member = memberService.GetByEmail(model.EmailAddress);
            
            if (member.Username != null)
            {
               
                //Set expiry date to 48 hours from now
                DateTime expiryTime = DateTime.Now.AddHours(48);

                //update the resetPasswordToken property for the member
                var token = Guid.NewGuid();
                member.SetValue("ResetPasswordToken", token);
                member.SetValue("ResetPasswordExpireDate", expiryTime);

                //    //Save the member with the up[dated property value
                memberService.Save(member);
                ViewData["Saved"] = "saved";
                var firstHalfEmail = "<!DOCTYPE HTML><html xmlns='http://www.w3.org/1999/xhtml' xmlns:v='urn:schemas-microsoft-com:vml' xmlns:o='urn:schemas-microsoft-com:office:office'><head><title>Reset Password</title> <!--[if !mso]><!-- --><meta http-equiv='X-UA-Compatible' content='IE=edge'> <!--<![endif]--><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1'><style type='text/css'>#outlook a{padding:0}body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{padding:20px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}.h1{font-size:36px;font-weight:700;color:#153558;letter-spacing:0;line-height:43px;margin-bottom:0}p{font-family:'Open Sans',sans-serif;font-size:18px;line-height:1.666em;font-weight:400;color:#254151;display:block;margin:13px 0}.button{background:#619ECE;border-radius:25.5px;font-weight:700;font-size:14px;color:#fff!important;line-height:40px;padding:0 24px;border:0;height:40px;display:inline-flex;align-items:center;text-decoration:none;font-family:'Open Sans',sans-serif}</style><!--[if mso]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--> <!--[if lte mso 11]><style type='text/css'>.outlook-group-fix{width:100% !important}</style><![endif]--><!--[if !mso]><!--><link href='https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap' rel='stylesheet' type='text/css'><style type='text/css'>@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');</style><!--<![endif]--></head><body style='background-color:#E1E1E1;'><div style='display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;'> Need to reset your password? No biggie. Just click below to get started.</div><div style='background-color:#E1E1E1;'><!--[if mso | IE]><table align='center' border='0' cellpadding='0' cellspacing='0' class='' style='width:600px;' width='600' ><tr><td style='line-height:0px;font-size:0px;mso-line-height-rule:exactly;'> <![endif]--><div style='background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;'><table align='center' border='0' cellpadding='0' cellspacing='0' role='presentation' style='background:#ffffff;background-color:#ffffff;width:100%;'><tbody><tr><td style='direction:ltr;font-size:0px;padding:0px;text-align:center;'> <!--[if mso | IE]><table role='presentation' border='0' cellpadding='0' cellspacing='0'><tr><td class='' style='vertical-align:top;width:600px;' > <![endif]--><div class='mj-column-per-100 outlook-group-fix' style='font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;'><table border='0' cellpadding='0' cellspacing='0' role='presentation' width='100%'><tbody><tr><td style='vertical-align:top;padding:0px;'><table border='0' cellpadding='0' cellspacing='0' role='presentation' style='' width='100%'><tr><td align='center' style='font-size:0px;padding:0px;word-break:break-word;'><table border='0' cellpadding='0' cellspacing='0' role='presentation' style='border-collapse:collapse;border-spacing:0px;'><tbody><tr><td style='width:600px;'></td></tr><tr><td style='width:600px;'><p class='h1'>Reset your sgf.dev password</p><p>Need to reset your password? No biggie. Just click below to get started.</p></td></tr><tr><td style='width:600px;'> <a href='https://sgf.dev/reset-password?token=";
                var secondHalfEmail = "' class='button'>Reset Your Password</a></td></tr></tbody></table></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table> <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table> <![endif]--></div></body></html>";
                var mm = new MailMessage
                {
                    Body = firstHalfEmail + member.GetValue("ResetPasswordToken") + secondHalfEmail,
                    IsBodyHtml = true,
                    Subject = "Reset SGF.Dev Password",
                    From = new MailAddress("noreply@sgf.dev")

                };

                mm.To.Add(new MailAddress(model.EmailAddress.ToString()));

                new SmtpClient().Send(mm);


                //    //EmailHelper email = new EmailHelper();
                //    //email.SendResetPasswordEmail(findMember.Email, expiryTime.ToString("ddMMyyyyHHmmssFFFF"));
                return CurrentUmbracoPage();
            }
            else
            {
                return CurrentUmbracoPage();

            }

        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult HandleResetPassword(ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return PartialView("ResetPassword", model);
            }

            //Get the querystring token
            var token = Request.QueryString["token"];

            //Ensure we have a vlaue in query string
            if (!string.IsNullOrEmpty(token))
            {
                var memberService = Services.MemberService;
                //Find the member with the email address
                var members = memberService.GetMembersByPropertyValue("ResetPasswordToken", token);
                var member = members.FirstOrDefault();
                //Ensure we have that member
                if (member != null)
                {
                    //See if the QS matches the value on the member property
                    if (member.GetValue("ResetPasswordToken").ToString() == token)
                    {

                        //Got a match, now check to see if the 15min window hasnt expired
                        DateTime expiryTime = member.GetValue<DateTime>("ResetPasswordExpireDate");

                        //Check the current time is less than the expiry time
                        DateTime currentTime = DateTime.Now;

                        //Check if date has NOT expired (been and gone)
                        if (currentTime.CompareTo(expiryTime) < 0)
                        {

                            try
                            {
                                memberService.SavePassword(member, model.Password);
                            }
                            catch (Exception e)
                            {
                                return CurrentUmbracoPage();
                            }

                            return Redirect("/login");
                        }
                        else
                        {
                            //ERROR: Reset token has expired
                            // todo: send message to reset page to show an explaination why they got there.
                            return CurrentUmbracoPage();
                        }
                    }
                    else
                    {
                        //ERROR: query string does not match what is stored on member property
                        //Invalid token
                        ModelState.AddModelError("ResetPasswordForm.", "Invalid Token");
                        return CurrentUmbracoPage();
                    }
                }
                else
                {
                    //ERROR: No query present
                    //Invalid Token
                    ModelState.AddModelError("ResetPasswordForm.", "Invalid Token");
                    return CurrentUmbracoPage();
                }
            }

            return PartialView("ResetPassword", model);
        }
    }
}