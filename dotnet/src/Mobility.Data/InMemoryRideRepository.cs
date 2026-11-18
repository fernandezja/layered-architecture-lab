using Mobility.Data.Abstractions;
using Mobility.Entities;

namespace Mobility.Data;

public sealed class InMemoryRideRepository : IRideRepository
{
    private readonly Dictionary<Guid, Ride> _ridesDb = [];

    public IReadOnlyList<Ride> GetAll() {
        return _ridesDb.Values.ToArray();
    }

    public Ride? GetById(Guid id) { 
        return _ridesDb.TryGetValue(id, out var ride) ? ride with { } : null; 
    }


    public void Save(Ride ride) {
        _ridesDb[ride.Id] = ride with { };
    }
}
