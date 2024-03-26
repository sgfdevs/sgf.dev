using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SGFDevs.Dev;
using Umbraco.Cms.Web.Common.Controllers;
using Examine;
using SGFDevs.ViewModels;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Web.Common;
using Member = Umbraco.Cms.Web.Common.PublishedModels.Member;
using Umbraco.Extensions;
using Tag = Umbraco.Cms.Web.Common.PublishedModels.Tag;
using Umbraco.Cms.Core.Models;

namespace SGFDevs.Controllers;

public class APIController : UmbracoApiController
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
    private IJsonSerializer _serializer;
    private MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;


    public APIController(DirectoryHelper directoryHelper, IMemberService memberService, IExamineManager examineManager, UmbracoHelper helper, IMemberManager memberManager, IMediaService mediaService, MediaFileManager mediaFileManager, IShortStringHelper shortStringHelper, IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, IJsonSerializer serializer, MediaUrlGeneratorCollection mediaUrlGeneratorCollection)
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
        _serializer = serializer;
        _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
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
            var query = criteria.GroupedOr(new string[] { "nodeName", "skillKeys", "skillsTags", "skills", "skillIds" }, skillsParam as string[]);
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
    public async Task<IActionResult> UploadProfileImage()
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        var memberById = await _memberManager.FindByIdAsync(currentMember.Id);
        var member = _memberManager.AsPublishedMember(memberById) as Member;

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

    private DirectoryResult BuildDirectoryResult(IMember member, List<Tag> allMemberTags)
    {
        var foundingMemberTag = allMemberTags.FirstOrDefault(x => x.Name?.ToLower() == "founding member");
        var supportingMember2024Tag = allMemberTags.FirstOrDefault(x => x.Name?.ToLower() == "2024 supporting member");
        var url = "/member/" + member.Username;
        var location = member.GetValue("city") + ", " + member.GetValue("state");
        var image = "/images/pipey.jpg";

        if(member.GetValue("ProfileImage") != null)
        {
            var imageUdi = member.GetValue("ProfileImage").ToString();
            image = _helper.Media(UdiParser.Parse(imageUdi)).GetCropUrl(width: 800);
        }

        var isFoundingMember = false;
        var isSupportingMember2024 = false;
        var memberTags = member.GetValue("MemberTags")?.ToString();
        if (foundingMemberTag != null && memberTags != null)
        {
            isFoundingMember = memberTags.Contains(foundingMemberTag.Key.ToString().Replace("-", ""));
        }

        if (supportingMember2024Tag != null && memberTags != null)
        {
            isSupportingMember2024 = memberTags.Contains(supportingMember2024Tag.Key.ToString().Replace("-", ""));
        }

        return new DirectoryResult
        {
            Name = member.Name,
            Location = location,
            Image = image,
            Url = url,
            IsFoundingMember = isFoundingMember,
            Is2024SupportingMember = isSupportingMember2024,
        };
    }
}
