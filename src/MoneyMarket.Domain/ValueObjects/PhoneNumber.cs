using System.Text.RegularExpressions;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.ValueObjects;

public sealed partial class PhoneNumber : ValueObject
{
    public string CountryCode { get; }
    public string Number { get; }

    private PhoneNumber(string countryCode, string number)
    {
        CountryCode = countryCode;
        Number = number;
    }

    public static PhoneNumber Create(string countryCode, string number)
    {
        if (string.IsNullOrWhiteSpace(countryCode))
            throw new ArgumentException("Country code is required.", nameof(countryCode));

        if (string.IsNullOrWhiteSpace(number))
            throw new ArgumentException("Phone number is required.", nameof(number));

        var normalizedCountryCode = countryCode.Trim().TrimStart('+');
        var normalizedNumber = DigitsOnlyRegex().Replace(number, string.Empty);

        if (!CountryCodeRegex().IsMatch(normalizedCountryCode))
            throw new ArgumentException("Invalid country code format.", nameof(countryCode));

        if (normalizedNumber.Length < 7 || normalizedNumber.Length > 15)
            throw new ArgumentException("Phone number must be between 7 and 15 digits.", nameof(number));

        return new PhoneNumber(normalizedCountryCode, normalizedNumber);
    }

    public static PhoneNumber CreateUS(string number)
    {
        return Create("1", number);
    }

    public string ToE164Format() => $"+{CountryCode}{Number}";

    public string ToFormattedString()
    {
        if (CountryCode == "1" && Number.Length == 10)
        {
            return $"+1 ({Number[..3]}) {Number[3..6]}-{Number[6..]}";
        }
        return ToE164Format();
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return CountryCode;
        yield return Number;
    }

    public override string ToString() => ToE164Format();

    [GeneratedRegex(@"[^\d]")]
    private static partial Regex DigitsOnlyRegex();

    [GeneratedRegex(@"^\d{1,4}$")]
    private static partial Regex CountryCodeRegex();
}
