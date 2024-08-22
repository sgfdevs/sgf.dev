using System;
using System.Linq;
using System.Threading.Tasks;
using J2N.Collections.Generic;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using SGFDevs.Dev;
using SGFDevs.Models;
using SGFDevs.ViewModels;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Common.Models;
using Umbraco.Cms.Web.Common.PublishedModels;
using Umbraco.Cms.Web.Common.Security;
using Umbraco.Cms.Web.Website.Controllers;

namespace SGFDevs.Controllers;

public class AccountController : SurfaceController
{
    private IMemberSignInManager _memberSignInManager;
    private IMemberManager _memberManager;
    private IMemberService _memberService;
    private DirectoryHelper _directoryHelper;

    public AccountController(IUmbracoContextAccessor umbracoContextAccessor, IUmbracoDatabaseFactory databaseFactory, ServiceContext services, AppCaches appCaches, IProfilingLogger profilingLogger, IPublishedUrlProvider publishedUrlProvider, IMemberSignInManager memberSignInManager, IMemberManager memberManager, IMemberService memberService, DirectoryHelper directoryHelper) : base(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
    {
        _memberSignInManager = memberSignInManager;
        _memberManager = memberManager;
        _memberService = memberService;
        _directoryHelper = directoryHelper;
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginModel model)
    {
        if (!ModelState.IsValid)
            return CurrentUmbracoPage();

        var loginResult = await _memberSignInManager.PasswordSignInAsync(model.Username, model.Password, true,false);
        if (loginResult.Succeeded)
        {
            return Redirect("/");
        }

        ModelState.AddModelError(string.Empty, "Unable to log in.");

        // Might need to check this out. Currently the ValidateCredentialsAsync does not want
        // to validate any credentials from the V8 version of Umbraco which used the old
        // Membership Provider. So for now, skipping the validation and just attempting a login
        // This will work but as it stands there is no distinguishing a bad credentials
        // from some other issue, like no account, etc. And maybe this ends up being a non issue.
        // 🤷 - Myke


        // var validCredentials = await _memberManager.ValidateCredentialsAsync(model.Username, model.Password);
        //
        // if (validCredentials)
        // {
        //     var loginResult = await _memberSignInManager.PasswordSignInAsync(model.Username, model.Password, true,false);
        //     if (loginResult.Succeeded)
        //     {
        //         return Redirect("/");
        //     }
        //
        //     ModelState.AddModelError(string.Empty, "Unable to log in.");
        // }
        // else
        // {
        //     ModelState.AddModelError(string.Empty, "Wrong credentials");
        // }

        return CurrentUmbracoPage();
    }

    public async Task<IActionResult> Logout()
    {
        await _memberSignInManager.SignOutAsync();
        return Redirect("/");
    }

    public async Task<IActionResult> Register(RegisterModel model)
    {
        if (!ModelState.IsValid)
            return CurrentUmbracoPage();

        if (_memberService.GetByEmail(model.Email) != null)
        {
            ModelState.AddModelError("", "A member with that email already exists.");
            return CurrentUmbracoPage();
        }

        if (_memberService.GetByUsername(model.Username) != null)
        {
            ModelState.AddModelError("", "Ope. This username is already taken.");
            return CurrentUmbracoPage();
        }

        var fullName = model.FirstName + " " + model.LastName;
        var identityMember = MemberIdentityUser.CreateNew(model.Username, model.Email, "Member", true, fullName);
        var identityResult = await _memberManager.CreateAsync(identityMember, model.Password);

        if (identityResult.Succeeded)
        {
            await _memberManager.AddToRolesAsync(identityMember, new string[] { "SGF Devs" });

            //save the additional details using the MemberService
            var member = _memberService.GetByKey(identityMember.Key);
            member.SetValue("FirstName", model.FirstName);
            member.SetValue("LastName", model.LastName);
            member.SetValue("Username", model.Username);
            _memberService.Save(member);

            await _memberSignInManager.SignInAsync(identityMember, true);

            return Redirect("/account");
        }

        ModelState.AddModelError("", "Password too weak");
        return CurrentUmbracoPage();
    }

    [HttpPost]
    public IActionResult ProfileUpdate(MemberProfile profile)
    {
        var member = _memberService.GetByKey(profile.MemberKey);
        member.Email = profile.Email;
        member.SetValue("FirstName", profile.FirstName);
        member.SetValue("LastName", profile.LastName);
        member.SetValue("JobTitle", profile.JobTitle);
        member.SetValue("AboutText", profile.AboutText);
        member.SetValue("City", profile.City);
        member.SetValue("State", profile.State);
        member.SetValue("AvailableForHire", profile.AvailableForHire);
        member.SetValue("AvailableForContractWork", profile.AvailableForContractWork);
        member.SetValue("TwitterUrl", profile.TwitterUrl);
        member.SetValue("TwitchUrl", profile.TwitchUrl);
        member.SetValue("FacebookUrl", profile.FacebookUrl);
        member.SetValue("InstagramUrl", profile.InstagramUrl);
        member.SetValue("LinkedInUrl", profile.LinkedInUrl);
        member.SetValue("MeetupUrl", profile.MeetupUrl);
        member.SetValue("WebsiteUrl", profile.WebsiteUrl);
        member.SetValue("YouTubeUrl", profile.YouTubeUrl);

        //Skills
        if(!string.IsNullOrEmpty(profile.Skills))
        {
            var selectedSkills = profile.Skills.Split(',').ToList();
            var newSkills = new List<string>();

            foreach (var selectedSkill in selectedSkills)
            {
                var skillKey = Guid.Parse(selectedSkill);
                var skillUdi = Udi.Create(Constants.UdiEntityType.Document, skillKey);
                newSkills.Add(skillUdi.ToString());
            }

            member.SetValue("SkillsTags", string.Join(",", newSkills));
        } else
        {
            member.SetValue("SkillsTags", "");
        }

        //Groups
        if(!string.IsNullOrEmpty(profile.Groups))
        {
            var selectedGroups = profile.Groups.Split(',').ToList();
            var newGroups = new List<string>();

            foreach (var selectedGroup in selectedGroups)
            {
                var groupKey = Guid.Parse(selectedGroup);
                var groupUdi = Udi.Create(Constants.UdiEntityType.Document, groupKey);
                newGroups.Add(groupUdi.ToString());
            }

            member.SetValue("Groups", string.Join(",", newGroups));
        } else
        {
            member.SetValue("Groups", "");
        }

        // Profile Image
        if(!string.IsNullOrEmpty(profile.ProfileImagePath))
        {
            member.SetValue("ProfileImage", profile.ProfileImagePath);
        }

        _memberService.Save(member);

        return Redirect("/account");
    }
}
