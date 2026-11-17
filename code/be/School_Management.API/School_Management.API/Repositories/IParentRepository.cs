using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IParentRepository
    {
        public Task<Guid?> GetParentIdByUserId(Guid userId);
        public Task<bool> IsParentOfStudent(Guid parentUserId, Guid studentId);
        public Task<PagedResponse<ParentListResponse>> GetAllParents(ParentFilterRequest request);
        public Task<(ParentInfoResponse? data, string message)> GetParentById(Guid parentId);
        public Task<(ParentInfoResponse? data, string message)> GetParentByUserId(Guid userId);
        public Task<(List<ChildInfoResponse>? data, string message)> GetChildrenByUserId(Guid userId);
    }
}
