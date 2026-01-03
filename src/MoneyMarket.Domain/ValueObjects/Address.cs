using MoneyMarket.Domain.Common;

namespace MoneyMarket.Domain.ValueObjects;

public sealed class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string PostalCode { get; }
    public string Country { get; }
    public string? Unit { get; }

    private Address(string street, string city, string state, string postalCode, string country, string? unit)
    {
        Street = street;
        City = city;
        State = state;
        PostalCode = postalCode;
        Country = country;
        Unit = unit;
    }

    public static Address Create(
        string street,
        string city,
        string state,
        string postalCode,
        string country,
        string? unit = null)
    {
        if (string.IsNullOrWhiteSpace(street))
            throw new ArgumentException("Street is required.", nameof(street));

        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City is required.", nameof(city));

        if (string.IsNullOrWhiteSpace(state))
            throw new ArgumentException("State is required.", nameof(state));

        if (string.IsNullOrWhiteSpace(postalCode))
            throw new ArgumentException("Postal code is required.", nameof(postalCode));

        if (string.IsNullOrWhiteSpace(country))
            throw new ArgumentException("Country is required.", nameof(country));

        return new Address(
            street.Trim(),
            city.Trim(),
            state.Trim(),
            postalCode.Trim(),
            country.Trim(),
            unit?.Trim());
    }

    public string ToSingleLine()
    {
        var parts = new List<string> { Street };
        if (!string.IsNullOrWhiteSpace(Unit))
            parts.Add($"Unit {Unit}");
        parts.Add(City);
        parts.Add($"{State} {PostalCode}");
        parts.Add(Country);
        return string.Join(", ", parts);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Street.ToLowerInvariant();
        yield return City.ToLowerInvariant();
        yield return State.ToLowerInvariant();
        yield return PostalCode.ToLowerInvariant();
        yield return Country.ToLowerInvariant();
        yield return Unit?.ToLowerInvariant() ?? string.Empty;
    }

    public override string ToString() => ToSingleLine();
}
