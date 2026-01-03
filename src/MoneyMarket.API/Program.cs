using System.Reflection;
using Microsoft.OpenApi.Models;
using MoneyMarket.API.Middleware;
using MoneyMarket.Application;
using MoneyMarket.Infrastructure;
using MoneyMarket.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPersistence(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with XML documentation
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MoneyMarket API",
        Version = "v1",
        Description = "A comprehensive P2P Lending Marketplace API that enables borrowers to request loans and lenders to invest in loan opportunities.",
        Contact = new OpenApiContact
        {
            Name = "MoneyMarket Support",
            Email = "support@moneymarket.com",
            Url = new Uri("https://moneymarket.com/support")
        },
        License = new OpenApiLicense
        {
            Name = "MIT License",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    // Include XML comments from controllers
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }

    // Add JWT Bearer authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token in the format: Bearer {your token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Enable annotations
    options.EnableAnnotations();

    // Custom schema IDs to avoid conflicts
    options.CustomSchemaIds(type => type.FullName?.Replace("+", "."));

    // Add tags for better organization
    options.TagActionsBy(api =>
    {
        if (api.GroupName != null)
            return new[] { api.GroupName };

        if (api.ActionDescriptor is Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor controllerActionDescriptor)
            return new[] { controllerActionDescriptor.ControllerName };

        return new[] { "Other" };
    });

    // Order tags alphabetically
    options.OrderActionsBy(api => api.RelativePath);
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetValue<string>("Cors:AllowedOrigins") ?? "http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options =>
    {
        options.RouteTemplate = "api-docs/{documentName}/swagger.json";
    });

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/api-docs/v1/swagger.json", "MoneyMarket API v1");
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "MoneyMarket API Documentation";
        options.DefaultModelsExpandDepth(2);
        options.DefaultModelExpandDepth(2);
        options.DisplayRequestDuration();
        options.EnableDeepLinking();
        options.EnableFilter();
        options.ShowExtensions();
        options.EnableValidator();
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
