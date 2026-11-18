namespace Mobility.Business.Errors;

public sealed class BusinessException(
    string code,
    string message,
    BusinessErrorKind kind) : Exception(message)
{
    public string Code { get; } = code;

    public BusinessErrorKind Kind { get; } = kind;
}
