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

        /// <summary>
        /// Renders the Forgotten Password view
        /// @Html.Action("RenderForgottenPassword","AuthSurface");
        /// </summary>
        /// <returns></returns>
        public ActionResult RenderForgottenPassword()
        {
            return PartialView("ForgottenPassword", new ResetPasswordViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult HandleForgottenPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return PartialView("ForgottenPassword", model);
            }

            var memberService = Services.MemberService;
            //Find the member with the email address
            var member = memberService.GetByEmail(model.EmailAddress);

            if (member != null)
            {
                //Set expiry date to 48 hours from now
                DateTime expiryTime = DateTime.Now.AddHours(48);

                //update the resetPasswordToken property for the member
                var token = GenerateUniqueCode();
                member.SetValue("resetPasswordToken",token );
                member.SetValue("resetPasswordExpireDate", expiryTime.ToString("ddMMyyyyHHmmssFFFF"));

                //Save the member with the up[dated property value
                memberService.Save(member);

                //Send user an email to reset password with token in it
                //EmailHelper email = new EmailHelper();
                //email.SendResetPasswordEmail(findMember.Email, expiryTime.ToString("ddMMyyyyHHmmssFFFF"));
            }
            else
            {
                ModelState.AddModelError("ForgottenPasswordForm.", "No member found");
                return PartialView("ForgottenPassword", model);
            }

            return PartialView("ForgottenPassword", model);
        }

        private object GenerateUniqueCode()
        {
            throw new NotImplementedException();
        }
    }
}