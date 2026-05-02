using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SGFDevs.Models;
using SGFDevs.ViewModels;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Mail;
using Umbraco.Cms.Core.Models.Email;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Web.Common.Models;
using Umbraco.Cms.Web.Common.Filters;
using Umbraco.Cms.Web.Common.Security;
using Umbraco.Cms.Web.Website.Controllers;
using Umbraco.Extensions;

namespace SGFDevs.Controllers;

[AutoValidateAntiforgeryToken]
public class AccountController : SurfaceController
{
    private readonly IMemberSignInManager _memberSignInManager;
    private readonly IMemberManager _memberManager;
    private readonly IMemberService _memberService;
    private readonly UmbracoHelper _umbracoHelper;
    private readonly IEmailSender _emailSender;
    private readonly IOptions<GlobalSettings> _globalSettings;
    private readonly ILogger<AccountController> _logger;

    public AccountController(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbracoDatabaseFactory databaseFactory,
        ServiceContext services,
        AppCaches appCaches,
        IProfilingLogger profilingLogger,
        IPublishedUrlProvider publishedUrlProvider,
        IMemberSignInManager memberSignInManager,
        IMemberManager memberManager,
        IMemberService memberService,
        UmbracoHelper umbracoHelper,
        IEmailSender emailSender,
        IOptions<GlobalSettings> globalSettings,
        ILogger<AccountController> logger
        ) : base(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
    {
        _memberSignInManager = memberSignInManager;
        _memberManager = memberManager;
        _memberService = memberService;
        _umbracoHelper = umbracoHelper;
        _emailSender = emailSender;
        _globalSettings = globalSettings;
        _logger = logger;
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

    [HttpPost]
    [UmbracoMemberAuthorize]
    public async Task<IActionResult> Logout()
    {
        await _memberSignInManager.SignOutAsync();
        return Redirect("/");
    }

    [HttpPost]
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
    public async Task<IActionResult> ForgotPassword(ForgotPasswordModel model)
    {
        if (!ModelState.IsValid)
            return CurrentUmbracoPage();

        if (_emailSender.CanSendRequiredEmail() == false)
        {
            ModelState.AddModelError(string.Empty, "Password reset is unavailable right now.");
            return CurrentUmbracoPage();
        }

        var fromAddress = _globalSettings.Value.Smtp?.From;
        if (string.IsNullOrWhiteSpace(fromAddress))
        {
            ModelState.AddModelError(string.Empty, "Password reset is unavailable right now.");
            return CurrentUmbracoPage();
        }

        var resetPage = _umbracoHelper
            .ContentAtRoot()
            .SelectMany(root => root.DescendantsOrSelf())
            .FirstOrDefault(content => content.ContentType.Alias == "resetPassword");

        if (resetPage == null)
        {
            _logger.LogError("Unable to locate the reset password page in content.");
            ModelState.AddModelError(string.Empty, "Password reset is unavailable right now.");
            return CurrentUmbracoPage();
        }

        var resetPageUrl = resetPage.Url(mode: UrlMode.Absolute);
        if (Uri.TryCreate(resetPageUrl, UriKind.Absolute, out _) == false)
        {
            _logger.LogError("Unable to build an absolute URL for the reset password page.");
            ModelState.AddModelError(string.Empty, "Password reset is unavailable right now.");
            return CurrentUmbracoPage();
        }

        var member = await _memberManager.FindByEmailAsync(model.Email);
        if (member != null)
        {
            try
            {
                var token = await _memberManager.GeneratePasswordResetTokenAsync(member);
                var resetLink = QueryHelpers.AddQueryString(resetPageUrl, new Dictionary<string, string>
                {
                    ["memberId"] = member.Id,
                    ["token"] = token,
                });

                var subject = "Reset your Springfield Devs password";
                var body = $"<p>Hi {member.Name},</p><p>Someone requested a password reset for your Springfield Devs account.</p><p>If that was you, use the link below to choose a new password:</p><p><a href=\"{resetLink}\">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>";
                var emailMessage = new EmailMessage(fromAddress, member.Email, subject, body, true);

                await _emailSender.SendAsync(emailMessage, "PasswordReset", true, _globalSettings.Value.Smtp?.EmailExpiration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send a password reset email for member {MemberId}.", member.Id);
            }
        }

        TempData["ForgotPasswordMessage"] = "If an account exists for that email, we sent a reset link.";
        return Redirect("/forgotten-password");
    }

    [HttpPost]
    public async Task<IActionResult> ResetPassword(ResetPasswordModel model)
    {
        if (!ModelState.IsValid)
            return CurrentUmbracoPage();

        var member = await _memberManager.FindByIdAsync(model.MemberId);
        if (member == null)
        {
            ModelState.AddModelError(string.Empty, "This reset link is invalid or has expired.");
            return CurrentUmbracoPage();
        }

        var result = await _memberManager.ResetPasswordAsync(member, model.Token, model.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }

            return CurrentUmbracoPage();
        }

        TempData["LoginMessage"] = "Your password has been updated. Please log in.";
        return Redirect("/login");
    }

    [HttpPost]
    [UmbracoMemberAuthorize]
    public async Task<IActionResult> ProfileUpdate(MemberProfile profile)
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
        {
            return Forbid();
        }

        var member = _memberService.GetByKey(currentMember.Key);
        var fullName = string.Join(" ", new[] { profile.FirstName, profile.LastName }
            .Where(value => !string.IsNullOrWhiteSpace(value)));

        if (!string.IsNullOrWhiteSpace(fullName))
        {
            member.Name = fullName;
        }

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
