using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    // Dữ liệu của con mà phụ huynh được phép xem (chỉ đọc).
    // Mọi hàm đều kiểm tra học sinh có phải là con của phụ huynh đang đăng nhập hay không.
    public interface IParentChildService
    {
        public Task<PagedResponse<FeeDetailResponse>> GetChildFees(Guid parentUserId, Guid studentId, MyFeeDetailFilterRequest request);
    }
}
