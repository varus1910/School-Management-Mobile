using School_Management.API.Exceptions;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ParentAccessService : IParentAccessService
    {
        private readonly IParentRepository parentRepository;

        public ParentAccessService(IParentRepository parentRepository)
        {
            this.parentRepository = parentRepository;
        }

        public async Task EnsureParentOwnsStudent(Guid parentUserId, Guid studentId)
        {
            var isOwner = await parentRepository.IsParentOfStudent(parentUserId, studentId);
            if (!isOwner) throw new ForbiddenException("Bạn không có quyền xem thông tin của học sinh này");
        }
    }
}
