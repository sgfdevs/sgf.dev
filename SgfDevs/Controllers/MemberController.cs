using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.PublishedModels;
using Umbraco.Cms.Web.Common.Security;

namespace SGFDevs.Controllers;

public class MemberController : UmbracoPageController, IVirtualPageController
{
    private MemberManager _memberManager;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private ILogger<MemberController> _logger;

    public MemberController(ILogger<MemberController> logger, ICompositeViewEngine compositeViewEngine, IUmbracoContextAccessor umbracoContextAccessor, MemberManager memberManager) : base(logger, compositeViewEngine)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _memberManager = memberManager;
        _logger = logger;
    }

    public IPublishedContent FindContent(ActionExecutingContext actionExecutingContext)
    {
        return _umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext) ? umbracoContext.Content.GetByRoute("/member") : null;
    }
    
    [HttpGet]
    public async Task<IActionResult> MemberProfile(string username)
    {
        var iMember = _memberManager.FindByNameAsync(username);
        if (iMember.Result == null) return NotFound();
        
        var memberById = await _memberManager.FindByIdAsync(iMember.Result.Id);
        var member = _memberManager.AsPublishedMember(memberById) as Member;
        return View(member);
    }
}