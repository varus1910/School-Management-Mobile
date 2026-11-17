using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ParentService : IParentService
    {
        private readonly IParentRepository parentRepository;
        private readonly IUserService userService;

        public ParentService(IParentRepository parentRepository, IUserService userService)
        {
            this.parentRepository = parentRepository;
            this.userService = userService;
        }

        public async Task<PagedResponse<ParentListResponse>> GetAllParents(ParentFilterRequest request)
        {
            return await parentRepository.GetAllParents(request);
        }

        public async Task<ParentInfoResponse> GetParentById(Guid parentId)
        {
            var (result, message) = await parentRepository.GetParentById(parentId);
            return message switch
            {
                "NOT_FOUND_PARENT" => throw new NotFoundException("Phụ huynh không tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<ChildInfoResponse> LinkChild(Guid parentId, LinkChildRequest request)
        {
            var (result, message) = await parentRepository.LinkChild(parentId, request);
            return message switch
            {
                "NOT_FOUND_PARENT" => throw new NotFoundException("Phụ huynh không tồn tại"),
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Học sinh không tồn tại"),
                "CONFLICT_CHILD" => throw new ConflictException("Học sinh này đã được gắn cho phụ huynh rồi"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task UnlinkChild(Guid parentId, Guid studentId)
        {
            var (_, message) = await parentRepository.UnlinkChild(parentId, studentId);
            switch (message)
            {
                case "NOT_FOUND_PARENT": throw new NotFoundException("Phụ huynh không tồn tại");
                case "NOT_FOUND_LINK": throw new NotFoundException("Học sinh này chưa được gắn cho phụ huynh");
                case "SUCCESS": return;
                default: throw new Exception("Lỗi không xác định");
            }
        }

        public async Task<ParentInfoResponse> GetMyProfile(Guid userId)
        {
            var (result, message) = await parentRepository.GetParentByUserId(userId);
            return message switch
            {
                "NOT_FOUND_PARENT" => throw new NotFoundException("Bạn không phải là phụ huynh"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<ParentInfoResponse> UpdateMyProfile(UpdateAdminRequest request, Guid userId)
        {
            // Cập nhật thông tin tài khoản (kèm upload ảnh) dùng chung logic với các role khác
            await userService.UpdateMyProfileForAdmin(request, userId.ToString());
            return await GetMyProfile(userId);
        }

        public async Task<List<ChildInfoResponse>> GetMyChildren(Guid userId)
        {
            var (result, message) = await parentRepository.GetChildrenByUserId(userId);
            return message switch
            {
                "NOT_FOUND_PARENT" => throw new NotFoundException("Bạn không phải là phụ huynh"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
