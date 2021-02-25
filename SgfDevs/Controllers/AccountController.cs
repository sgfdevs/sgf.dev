using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Web.Mvc;
using System.Web.Mvc;
using SgfDevs.Models;

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
            }

            memberService.AssignRole(member.Id, "SGF Devs");

            member.SetValue("FirstName", model.FirstName);
            member.SetValue("LastName", model.LastName);
            member.SetValue("Username", model.Username);
            memberService.Save(member);

            Members.Login(model.Username, model.Password);

            return Redirect("/account");
        }
    }
}