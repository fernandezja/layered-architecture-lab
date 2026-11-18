using Mobility.Entities;

namespace Mobility.Data.Abstractions;

public interface IRideRepository
{
    IReadOnlyList<Ride> GetAll();

    Ride? GetById(Guid id);

    void Save(Ride ride);
}
