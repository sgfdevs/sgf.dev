using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Umbraco.Core.Services;
using Umbraco.Web.Models;
using Umbraco.Web.Mvc;

namespace SgfDevs.Controllers
{
    public class MemberController : RenderMvcController
    {
        private IMemberService _memberService;

        public MemberController(IMemberService memberService)
        {
            _memberService = memberService;
        }

        public override ActionResult Index(ContentModel model)
        {
            return base.Index(model);
        }

        public ActionResult MemberProfile(ContentModel model, string username)
        {
            var iMember = _memberService.GetByUsername(username);

            if(iMember != null)
            {
                var member = Umbraco.Member(iMember.Id) as Umbraco.Web.PublishedModels.Member;
                return View(member);
            }

            return HttpNotFound();
        }
    }
}