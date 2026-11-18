using Mobility.Entities;

namespace Mobility.Data.Abstractions;

public interface IDriverRepository
{
    IReadOnlyList<Driver> GetAll();

    Driver? GetById(Guid id);

    void Save(Driver driver);
}
