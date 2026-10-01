using AF.Umbraco.S3.Media.Storage.Options;
using Amazon;
using Amazon.Runtime;
using Amazon.Runtime.Credentials;
using Amazon.S3;
using Amazon.SecurityToken;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace SgfDevs.Tests;

[CollectionDefinition("AWS environment", DisableParallelization = true)]
public class AwsEnvironmentCollection;

[Collection("AWS environment")]
public class MediaStorageConfigurationTests
{
    [Fact]
    public void ProductionRequiresAnExplicitBucketAndUsesStandardAwsEndpoints()
    {
        var configuration = LoadConfiguration(development: false);
        var options = configuration.GetSection("Umbraco:Storage:AWSS3:Media").Get<AWSS3FileSystemOptions>()!;

        Assert.True(string.IsNullOrEmpty(options.BucketName));
        Assert.Equal("us-east-2", options.Region);
        Assert.Equal("media", options.MediaBucketPrefix);
        Assert.Equal("cache", options.CacheBucketPrefix);
        Assert.False(options.CacheRetention.Enabled);
        Assert.Null(options.CannedACL);
        Assert.Null(configuration["AWS:ServiceURL"]);
        Assert.Null(configuration["AWS:Profile"]);
        Assert.Null(configuration["SGFDevs:AzureBlobStorageKey"]);
    }

    [Fact]
    public void DevelopmentUsesItsOwnMinioBucketWithPathStyleAddressing()
    {
        var configuration = LoadConfiguration(development: true);

        Assert.Equal("sgf-dev-local", configuration["Umbraco:Storage:AWSS3:Media:BucketName"]);
        Assert.Equal("http://localhost:9000", configuration["AWS:ServiceURL"]);
        Assert.True(configuration.GetValue<bool>("AWS:ForcePathStyle"));
        Assert.Equal("us-east-2", configuration["AWS:Region"]);
    }

    [Fact]
    public void DefaultCredentialChainSelectsWebIdentityWithoutAccessKeys()
    {
        var tokenFile = Path.GetTempFileName();
        var variables = new Dictionary<string, string?>
        {
            ["AWS_ACCESS_KEY_ID"] = null,
            ["AWS_SECRET_ACCESS_KEY"] = null,
            ["AWS_SESSION_TOKEN"] = null,
            ["AWS_WEB_IDENTITY_TOKEN_FILE"] = tokenFile,
            ["AWS_ROLE_ARN"] = "arn:aws:iam::123456789012:role/sgfdevs-k3s/sgf-dev-test",
            ["AWS_ROLE_SESSION_NAME"] = "sgf-dev-test"
        };
        var originals = variables.Keys.ToDictionary(key => key, Environment.GetEnvironmentVariable);

        try
        {
            foreach (var variable in variables)
            {
                Environment.SetEnvironmentVariable(variable.Key, variable.Value);
            }

            var credentials = DefaultAWSCredentialsIdentityResolver.GetCredentials(
                new AmazonS3Config { RegionEndpoint = RegionEndpoint.USEast2 });
            var webIdentity = Assert.IsType<AssumeRoleWithWebIdentityCredentials>(credentials);
            Assert.Equal(tokenFile, webIdentity.WebIdentityTokenFile);
            Assert.Equal(variables["AWS_ROLE_ARN"], webIdentity.RoleArn);
            Assert.Equal("sgf-dev-test", webIdentity.RoleSessionName);
            // Loading STS here catches a missing deployment dependency without calling AWS.
            Assert.NotNull(typeof(AmazonSecurityTokenServiceClient).Assembly);
        }
        finally
        {
            foreach (var original in originals)
            {
                Environment.SetEnvironmentVariable(original.Key, original.Value);
            }
            File.Delete(tokenFile);
        }
    }

    private static IConfiguration LoadConfiguration(bool development)
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json");
        if (development)
        {
            builder.AddJsonFile("appsettings.Development.json");
        }
        return builder.Build();
    }
}
