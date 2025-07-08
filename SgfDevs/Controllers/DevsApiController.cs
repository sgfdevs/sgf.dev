using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SGFDevs.Dev;
using Examine;
using SgfDevs.Dev;
using SGFDevs.ViewModels;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Web.Common.Filters;
using Tag = Umbraco.Cms.Web.Common.PublishedModels.Tag;
using Umbraco.Extensions;

namespace SGFDevs.Controllers;

[ApiController]
public class DevsApiController : Controller
{
    private DirectoryHelper _directoryHelper;
    private IMemberService _memberService;
    private IExamineManager _examineManager;
    private UmbracoHelper _helper;
    private IMemberManager _memberManager;
    private IMediaService _mediaService;
    private MediaFileManager _mediaFileManager;
    private IShortStringHelper _shortStringHelper;
    private IContentTypeBaseServiceProvider _contentTypeBaseServiceProvider;
    private MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;
    private NewsletterHelper _newsletterHelper;
    private readonly MemberConverter _memberConverter;


    public DevsApiController(
        DirectoryHelper directoryHelper,
        IMemberService memberService,
        IExamineManager examineManager,
        UmbracoHelper helper,
        IMemberManager memberManager,
        IMediaService mediaService,
        MediaFileManager mediaFileManager,
        IShortStringHelper shortStringHelper,
        IContentTypeBaseServiceProvider contentTypeBaseServiceProvider,
        MediaUrlGeneratorCollection mediaUrlGeneratorCollection,
        NewsletterHelper newsletterHelper,
        MemberConverter memberConverter
    )
    {
        _directoryHelper = directoryHelper;
        _memberService = memberService;
        _examineManager = examineManager;
        _helper = helper;
        _memberManager = memberManager;
        _mediaService = mediaService;
        _mediaFileManager = mediaFileManager;
        _shortStringHelper = shortStringHelper;
        _contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
        _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
        _newsletterHelper = newsletterHelper;
        _memberConverter = memberConverter;
    }

    // GET
    [Route("api/tags/skills")]
    public IEnumerable<string> GetAllSkills()
    {
        var skills = _directoryHelper.GetSkills().ToList();
        return skills.Select(x => string.IsNullOrEmpty(x.DisplayName) ? x.Name : x.DisplayName);
    }

    [Route("api/directory/filters/skills")]
    public IActionResult GetSkillsFilters()
    {
        var _skills = _directoryHelper.GetSkills().ToList();

        var skills = from x in _skills
            select new
            {
                name = string.IsNullOrEmpty(x.DisplayName) ? x.Name : x.DisplayName,
                id = x.Id,
                key = x.Key,
                isActive = false
            };

        return Ok(skills.ToList());
    }

    [Route("api/directory/search")]
    public IActionResult GetSearch()
    {
        var memberResults = new List<DirectoryResult>();

        // This is pretty much one massive brainstorm cluster eff at this point. Psh.
        if (_examineManager.TryGetIndex(Constants.UmbracoIndexes.MembersIndexName, out var index))
        {
            var searcher = index.Searcher;
            var skillsQs = HttpContext.Request.Query["skills"].ToString();
            var allMemberTags = _directoryHelper.GetMemberTags();
            // Send back all the members if no params are set
            if (string.IsNullOrEmpty(skillsQs))
            {
                var allMembers = _directoryHelper.GetAllMembers()
                    .Select(member => BuildDirectoryResult(member, allMemberTags));

                return Ok(allMembers);
            }

            // Otherwise hit Lucene/Examine
            var skillsParam = skillsQs.Split(',');
            var criteria = searcher.CreateQuery("member");
            var query = criteria.GroupedOr(["nodeName", "skillKeys", "skillsTags", "skills", "skillIds"], skillsParam);
            var results = query.Execute();

            if (results.Any())
            {
                var ids = results.Select(result => int.Parse(result.Id)).ToArray();

                var filteredMembers = _memberService.GetAllMembers(ids)
                    .Select(member => BuildDirectoryResult(member, allMemberTags))
                    .OrderBy(m => m.Name);

                return Ok(filteredMembers);
            }
        }

        return Ok(memberResults);
    }

    [Route("api/profile/image-process")]
    [UmbracoMemberAuthorize]
    public async Task<IActionResult> UploadProfileImage()
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
        {
            return Forbid();
        }
        var member = _memberConverter.FromContent(_memberManager.AsPublishedMember(currentMember));

        //var request = HttpContext.Current.Request;
        //var request = HttpContext.Request;
        var request = Request;

        if (request.Form.Files.Count > 0)
        {
            var file = request.Form.Files[0];

            if(file.Length > 0)
            {
                var filesExtension = System.IO.Path.GetExtension(file.FileName);
                var newFileName = member.Username + filesExtension;
                var membersMediaFolder = _mediaService.GetRootMedia().FirstOrDefault(x => x.Name.InvariantEquals("Members"));

                // Need to explore and see if mediaService.SetMediaFileContent will work to
                // update an item if it already exists instead of always creating a new one.
                // For now, just create dupes!
                // - Myke
                var media = _mediaService.CreateMedia(member.Username, membersMediaFolder, Constants.Conventions.MediaTypes.Image);

                media.SetValue(
                    _mediaFileManager,
                    _mediaUrlGeneratorCollection,
                    _shortStringHelper,
                    _contentTypeBaseServiceProvider,
                    Constants.Conventions.Media.File,
                    newFileName,
                    file.OpenReadStream()
                );
                _mediaService.Save(media);

                var imageUdi = new GuidUdi("media", media.Key).ToString();

                return Ok(imageUdi);
            }
        }

        return BadRequest();
    }

    [HttpPost]
    [Route("api/newsletter/signup")]
    public async Task<IActionResult> NewsletterSignUp([FromForm] string email, [FromForm(Name = "name")] string honeypot)
    {
        if (string.IsNullOrEmpty(honeypot))
        {
            await _newsletterHelper.Subscribe(email);
        }

        return Ok();
    }

    private DirectoryResult BuildDirectoryResult(IMember umbracoMember, List<Tag> allMemberTags)
    {
        var member = _memberConverter.FromMember(umbracoMember);
        var url = "/member/" + member.Username;
        var location = member.City + ", " + member.State;
        var image = "/images/pipey.jpg";

        if(member.ProfileImage != null)
        {
            image = member.ProfileImage.GetCropUrl(width: 500);
        }

        var memberTags = member.MemberTags?.Cast<Tag>().ToList() ?? [];

        return new DirectoryResult
        {
            Name = member.Name,
            Location = location,
            Image = image,
            Url = url,
            Tags = memberTags.Select(t => !string.IsNullOrWhiteSpace(t.DisplayName) ? t.DisplayName : t.Name)
        };
    }
}
