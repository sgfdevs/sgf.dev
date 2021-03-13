using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web.Mvc;
using System.Web.Mvc;
using SgfDevs.Models;
using SgfDevs.ViewModels;

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

                //    //Send user an email to reset password with token in it
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