FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y curl ca-certificates
RUN mkdir -p /vsdbg && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg
EXPOSE 8080

# Copy the published application
COPY . ./
ENTRYPOINT ["dotnet", "WebAPI.dll"]