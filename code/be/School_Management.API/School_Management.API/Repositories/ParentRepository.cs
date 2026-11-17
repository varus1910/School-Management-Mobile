using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;

namespace School_Management.API.Repositories
{
    public class ParentRepository : IParentRepository
    {
        private readonly ApplicationDbContext context;

        public ParentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<Guid?> GetParentIdByUserId(Guid userId)
        {
            return await context.Parent
                                .AsNoTracking()
                                .Where(x => x.UserId == userId)
                                .Select(x => (Guid?)x.Id)
                                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsParentOfStudent(Guid parentUserId, Guid studentId)
        {
            return await context.ParentStudent
                                .AsNoTracking()
                                .AnyAsync(x => x.StudentId == studentId && x.Parent!.UserId == parentUserId);
        }
    }
}
