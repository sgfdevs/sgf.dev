using System;
using System.Data.Common;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using SGFDevs.Controllers;
using SgfDevs.Dev;
using SgfDevs.Dev.EventSync;
using SgfDevs.Dev.EventSync.Meetup;
using SgfDevs.Dev.EventSync.Sessionize;
using SgfDevs.HealthChecks;
using SGFDevs.Dev;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Persistence.Sqlite;
using Umbraco.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseSentry();

var umbracoBuilder = builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers();

var blobStorageKey = builder.Configuration["SGFDevs:AzureBlobStorageKey"];
if (string.IsNullOrEmpty(blobStorageKey))
{
    umbracoBuilder.AddCdnMediaUrlProvider(options =>
    {
        options.Url = new Uri("https://sgf.dev/media/");
    });
}
else
{
    umbracoBuilder.AddAzureBlobMediaFileSystem(options =>
    {
        options.ConnectionString = $"DefaultEndpointsProtocol=https;AccountName=sgfdevs;AccountKey={blobStorageKey};EndpointSuffix=core.windows.net";
        options.ContainerName = "website";
    });
}

umbracoBuilder.Build();

builder.Services.AddHealthChecks()
    .AddCheck<ReadinessHealthCheck>("ready", tags: ["ready"]);
builder.Services.AddHttpClient();
builder.Services.Configure<EventSyncOptions>(builder.Configuration.GetSection("SGFDevs"));
builder.Services.Configure<SiteFeaturesOptions>(builder.Configuration.GetSection("SGFDevs:Site"));
builder.Services.AddScoped<MemberConverter>();
builder.Services.AddScoped<MemberTagDisplayService>();
builder.Services.AddScoped<PresentationPresenterDisplayService>();
builder.Services.AddScoped(_ => new EventDisplayService(EventSyncTimeZoneResolver.Resolve(builder.Configuration["SGFDevs:EventTimeZoneId"])));
builder.Services.AddScoped<DirectoryHelper>();
builder.Services.AddScoped<NewsletterHelper>();
builder.Services.AddScoped<EventSyncImportFilter>();
builder.Services.AddScoped<PresenterMemberMatcher>();
builder.Services.AddScoped<SessionizeSyncPlanner>();
builder.Services.AddScoped<MeetupEventMatcher>();
builder.Services.AddScoped<ImportedPresenterBlockBuilder>();
builder.Services.AddScoped<SessionizeApiClient>();
builder.Services.AddScoped<MeetupApiClient>();
builder.Services.AddScoped<SessionizeSpeakerMediaService>();
builder.Services.AddScoped<SessionizeEventSyncService>();

var app = builder.Build();

if (builder.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

await app.BootUmbracoAsync();

var healthCheckOptions = new HealthCheckOptions
{
    ResponseWriter = static (_, _) => Task.CompletedTask
};
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = static _ => false,
    ResponseWriter = healthCheckOptions.ResponseWriter
}).AllowAnonymous();
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = static check => check.Tags.Contains("ready"),
    ResponseWriter = healthCheckOptions.ResponseWriter
}).AllowAnonymous();
app.MapGet("/robots.txt", (IOptions<SiteFeaturesOptions> siteFeatures) =>
    Results.Text(
        siteFeatures.Value.SearchIndexingEnabled
            ? "User-agent: *\nAllow: /\n"
            : "User-agent: *\nDisallow: /\n",
        "text/plain"
    )
).AllowAnonymous();

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.EndpointRouteBuilder.MapControllerRoute(
            "ProfileCustomRoute",
            "member/{username:regex(^[a-zA-Z0-9]+$)}",
            new { Controller = "Member", Action = "MemberProfile" });
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
