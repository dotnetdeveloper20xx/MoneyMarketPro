using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MoneyMarket.Domain.Common;

namespace MoneyMarket.Persistence.Configurations;

/// <summary>
/// Value converter for LoanId strongly typed ID.
/// </summary>
public class LoanIdConverter : ValueConverter<LoanId, Guid>
{
    public LoanIdConverter()
        : base(v => v.Value, v => LoanId.From(v))
    {
    }
}

/// <summary>
/// Value converter for LoanApplicationId strongly typed ID.
/// </summary>
public class LoanApplicationIdConverter : ValueConverter<LoanApplicationId, Guid>
{
    public LoanApplicationIdConverter()
        : base(v => v.Value, v => LoanApplicationId.From(v))
    {
    }
}

/// <summary>
/// Value converter for BorrowerProfileId strongly typed ID.
/// </summary>
public class BorrowerProfileIdConverter : ValueConverter<BorrowerProfileId, Guid>
{
    public BorrowerProfileIdConverter()
        : base(v => v.Value, v => BorrowerProfileId.From(v))
    {
    }
}

/// <summary>
/// Value converter for LenderProfileId strongly typed ID.
/// </summary>
public class LenderProfileIdConverter : ValueConverter<LenderProfileId, Guid>
{
    public LenderProfileIdConverter()
        : base(v => v.Value, v => LenderProfileId.From(v))
    {
    }
}

/// <summary>
/// Value converter for LoanFundingId strongly typed ID.
/// </summary>
public class LoanFundingIdConverter : ValueConverter<LoanFundingId, Guid>
{
    public LoanFundingIdConverter()
        : base(v => v.Value, v => LoanFundingId.From(v))
    {
    }
}

/// <summary>
/// Value converter for PaymentId strongly typed ID.
/// </summary>
public class PaymentIdConverter : ValueConverter<PaymentId, Guid>
{
    public PaymentIdConverter()
        : base(v => v.Value, v => PaymentId.From(v))
    {
    }
}

/// <summary>
/// Value converter for WalletId strongly typed ID.
/// </summary>
public class WalletIdConverter : ValueConverter<WalletId, Guid>
{
    public WalletIdConverter()
        : base(v => v.Value, v => WalletId.From(v))
    {
    }
}

/// <summary>
/// Value converter for UserId strongly typed ID.
/// </summary>
public class UserIdConverter : ValueConverter<UserId, Guid>
{
    public UserIdConverter()
        : base(v => v.Value, v => UserId.From(v))
    {
    }
}
