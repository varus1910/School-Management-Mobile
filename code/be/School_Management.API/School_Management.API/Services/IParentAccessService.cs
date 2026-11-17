namespace School_Management.API.Services
{
    public interface IParentAccessService
    {
        // Ném ForbiddenException nếu học sinh không phải là con của phụ huynh đang đăng nhập
        public Task EnsureParentOwnsStudent(Guid parentUserId, Guid studentId);
    }
}
