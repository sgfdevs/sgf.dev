using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SGFDevs.Controllers;
using SGFDevs.Dev;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace SGFDevs
{
    public class Startup
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        /// <summary>
        /// Initializes a new instance of the <see cref="Startup" /> class.
        /// </summary>
        /// <param name="webHostEnvironment">The web hosting environment.</param>
        /// <param name="config">The configuration.</param>
        /// <remarks>
        /// Only a few services are possible to be injected here https://github.com/dotnet/aspnetcore/issues/9337.
        /// </remarks>
        public Startup(IWebHostEnvironment webHostEnvironment, IConfiguration config)
        {
            _env = webHostEnvironment ?? throw new ArgumentNullException(nameof(webHostEnvironment));
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        /// <summary>
        /// Configures the services.
        /// </summary>
        /// <param name="services">The services.</param>
        /// <remarks>
        /// This method gets called by the runtime. Use this method to add services to the container.
        /// For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940.
        /// </remarks>
        public void ConfigureServices(IServiceCollection services)
        {
            var devsServices = services.AddUmbraco(_env, _config)
                .AddBackOffice()
                .AddWebsite()
                .AddComposers();

            if (string.IsNullOrEmpty(_config["SGFDevs:AzureBlobStorageKey"]))
            {
                devsServices.AddCdnMediaUrlProvider(options =>
                {
                    options.Url = new Uri("https://sgf.dev/media/");
                });
            }
            else
            {
                devsServices.AddAzureBlobMediaFileSystem(options =>
                {
                    options.ConnectionString = $"DefaultEndpointsProtocol=https;AccountName=sgfdevs;AccountKey={_config["SGFDevs:AzureBlobStorageKey"]};EndpointSuffix=core.windows.net";
                    options.ContainerName = "website";
                });
            }

            devsServices.Build();

            services.AddHttpClient();
            services.AddScoped<DirectoryHelper>();
            services.AddScoped<NewsletterHelper>();
        }

        /// <summary>
        /// Configures the application.
        /// </summary>
        /// <param name="app">The application builder.</param>
        /// <param name="env">The web hosting environment.</param>
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

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
                        "member/{username}",
                        new { Controller = "Member", Action = "MemberProfile" });
                    u.UseInstallerEndpoints();
                    u.UseBackOfficeEndpoints();
                    u.UseWebsiteEndpoints();
                });
        }
    }
}
