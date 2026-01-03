using System.Text.RegularExpressions;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.ValueObjects;

public sealed partial class EmailAddress : ValueObject
{
    public string Value { get; }

    private EmailAddress(string value)
    {
        Value = value;
    }

    public static EmailAddress Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email address is required.", nameof(email));

        var normalizedEmail = email.Trim().ToLowerInvariant();

        if (!EmailRegex().IsMatch(normalizedEmail))
            throw new ArgumentException("Invalid email address format.", nameof(email));

        if (normalizedEmail.Length > 254)
            throw new ArgumentException("Email address is too long.", nameof(email));

        return new EmailAddress(normalizedEmail);
    }

    public string Domain => Value.Split('@')[1];
    public string LocalPart => Value.Split('@')[0];

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(EmailAddress email) => email.Value;

    [GeneratedRegex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", RegexOptions.Compiled)]
    private static partial Regex EmailRegex();
}
