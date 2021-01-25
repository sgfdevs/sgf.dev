using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Umbraco.Core.Composing;
using Umbraco.Web;
using Umbraco.Web.Mvc;

namespace SgfDevs.Dev
{
    public class RegisterMemberProfileRouteComposer : ComponentComposer<RegisterMemberProfileRouteComponent>
    { }

    public class RegisterMemberProfileRouteComponent : IComponent
    {
        public void Initialize()
        {
            RouteTable.Routes.MapUmbracoRoute("ProfileCustomRoute", "member/{username}", new
            {
                controller = "Member",
                action = "MemberProfile",
                username = UrlParameter.Optional
            }, new UmbracoVirtualNodeByUrlRouteHandler("/member"));
        }

        public void Terminate()
        {
            // Nothing to terminate
        }
    }
}