using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IParentService
    {
        public Task<PagedResponse<ParentListResponse>> GetAllParents(ParentFilterRequest request);
        public Task<ParentInfoResponse> GetParentById(Guid parentId);
        public Task<ChildInfoResponse> LinkChild(Guid parentId, LinkChildRequest request);
        public Task UnlinkChild(Guid parentId, Guid studentId);
        public Task<ParentInfoResponse> GetMyProfile(Guid userId);
        public Task<ParentInfoResponse> UpdateMyProfile(UpdateAdminRequest request, Guid userId);
        public Task<List<ChildInfoResponse>> GetMyChildren(Guid userId);
    }
}
