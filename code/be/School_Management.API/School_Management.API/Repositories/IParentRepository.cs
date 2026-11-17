namespace School_Management.API.Repositories
{
    public interface IParentRepository
    {
        public Task<Guid?> GetParentIdByUserId(Guid userId);
        public Task<bool> IsParentOfStudent(Guid parentUserId, Guid studentId);
    }
}
