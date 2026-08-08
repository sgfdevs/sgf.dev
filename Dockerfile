FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /usr/src/main
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS publish
WORKDIR /src
COPY SgfDevs/SgfDevs.csproj SgfDevs/
RUN dotnet restore SgfDevs/SgfDevs.csproj
COPY SgfDevs/ SgfDevs/
RUN dotnet publish SgfDevs/SgfDevs.csproj -c Release --no-restore -o /app/publish

FROM base AS final
ENV ASPNETCORE_HTTP_PORTS=80
WORKDIR /usr/src/main
COPY --from=publish /app/publish .
RUN mkdir -p umbraco/Data && touch umbraco/Data/Umbraco.sqlite.db
ENTRYPOINT ["dotnet", "SgfDevs.dll"]
