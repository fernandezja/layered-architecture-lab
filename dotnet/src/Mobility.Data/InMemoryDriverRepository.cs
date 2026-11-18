using Mobility.Data.Abstractions;
using Mobility.Entities;

namespace Mobility.Data;

public sealed class InMemoryDriverRepository : IDriverRepository
{
    private readonly Dictionary<Guid, Driver> _driversDb = [];


    public IReadOnlyList<Driver> GetAll() { 
        return _driversDb.Values.ToArray();
    }


    public Driver? GetById(Guid id) {
        return _driversDb.TryGetValue(id, out var driver) ? driver with { } : null;
    }


    public void Save(Driver driver) {
        _driversDb[driver.Id] = driver with { };
    }
}
