using System;

namespace SGFDevs.ViewModels;

public class MemberProfile
{
    public int MemberId { get; set; }
    public Guid MemberKey { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string JobTitle { get; set; }
    public string ProfileImagePath { get; set; }
    public string AboutText { get; set; }
    public string Skills { get; set; }
    public string Groups { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public bool AvailableForHire { get; set; }
    public bool AvailableForContractWork { get; set; }
    public string TwitterUrl { get; set; }
    public string TwitchUrl { get; set; }
    public string FacebookUrl { get; set; }
    public string InstagramUrl { get; set; }
    public string LinkedInUrl { get; set; }
    public string MeetupUrl { get; set; }
    public string WebsiteUrl { get; set; }
    public string YouTubeUrl { get; set; }
}
