namespace MoneyMarket.Domain.Common;

public abstract record StronglyTypedId<T>(Guid Value) where T : StronglyTypedId<T>
{
    public override string ToString() => Value.ToString();
}

public record LoanId(Guid Value) : StronglyTypedId<LoanId>(Value)
{
    public static LoanId Create() => new(Guid.NewGuid());
    public static LoanId From(Guid value) => new(value);
}

public record LoanApplicationId(Guid Value) : StronglyTypedId<LoanApplicationId>(Value)
{
    public static LoanApplicationId Create() => new(Guid.NewGuid());
    public static LoanApplicationId From(Guid value) => new(value);
}

public record BorrowerProfileId(Guid Value) : StronglyTypedId<BorrowerProfileId>(Value)
{
    public static BorrowerProfileId Create() => new(Guid.NewGuid());
    public static BorrowerProfileId From(Guid value) => new(value);
}

public record LenderProfileId(Guid Value) : StronglyTypedId<LenderProfileId>(Value)
{
    public static LenderProfileId Create() => new(Guid.NewGuid());
    public static LenderProfileId From(Guid value) => new(value);
}

public record LoanFundingId(Guid Value) : StronglyTypedId<LoanFundingId>(Value)
{
    public static LoanFundingId Create() => new(Guid.NewGuid());
    public static LoanFundingId From(Guid value) => new(value);
}

public record PaymentId(Guid Value) : StronglyTypedId<PaymentId>(Value)
{
    public static PaymentId Create() => new(Guid.NewGuid());
    public static PaymentId From(Guid value) => new(value);
}

public record WalletId(Guid Value) : StronglyTypedId<WalletId>(Value)
{
    public static WalletId Create() => new(Guid.NewGuid());
    public static WalletId From(Guid value) => new(value);
}

public record UserId(Guid Value) : StronglyTypedId<UserId>(Value)
{
    public static UserId Create() => new(Guid.NewGuid());
    public static UserId From(Guid value) => new(value);
}
