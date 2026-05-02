using Microsoft.AspNetCore.Mvc;
using SGFDevs.Models;

namespace SGFDevs.Views.Components.ResetPassword;

public class ResetPasswordViewComponent : ViewComponent
{
    public IViewComponentResult Invoke(string memberId, string token)
    {
        return View(new ResetPasswordModel
        {
            MemberId = memberId,
            Token = token,
        });
    }
}
