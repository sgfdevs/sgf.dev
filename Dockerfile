FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
RUN mkdir -p /usr/src/main
WORKDIR /usr/src/main
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
RUN mkdir -p /src
WORKDIR /src
COPY "./SgfDevs/SgfDevs.csproj" "./SgfDevs/SgfDevs.csproj"
RUN dotnet restore "./SgfDevs/SgfDevs.csproj"
COPY . .
RUN dotnet build "./SgfDevs/SgfDevs.csproj" -c Release -o /usr/src/main/build

FROM build AS publish
RUN dotnet publish "./SgfDevs/SgfDevs.csproj" -c Release -o /usr/src/main/publish

FROM base AS final
ENV ASPNETCORE_HTTP_PORTS=80
WORKDIR /usr/src/main
COPY --from=publish /usr/src/main/publish .
RUN mkdir -p umbraco/Data && touch umbraco/Data/Umbraco.sqlite.db
ENTRYPOINT ["dotnet", "SgfDevs.dll"]
