using Application.Logging;
using Application.Services;
using Infrastructure.Context;
using Infrastructure.Logging;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddLogging();

builder.Services.AddSignalR();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

// Add Logging
builder.Services.AddScoped<ILoggerManager, LoggerManager>();

// Add Application Services
builder.Services.AddSingleton<DirectionsService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}



builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), (o) => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)).UseSnakeCaseNamingConvention()
);

app.Run();
