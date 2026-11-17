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
        public Task<List<Guid>> GetParentUserIdsByStudentIds(IEnumerable<Guid> studentIds);
        public Task<(ChildInfoResponse? data, string message)> LinkChild(Guid parentId, LinkChildRequest request);
        public Task<(bool result, string message)> UnlinkChild(Guid parentId, Guid studentId);
    }
}
