using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ParentChildService : IParentChildService
    {
        private readonly IParentAccessService parentAccessService;
        private readonly IStudentRepository studentRepository;
        private readonly IFeeDetailService feeDetailService;

        public ParentChildService(IParentAccessService parentAccessService, IStudentRepository studentRepository, IFeeDetailService feeDetailService)
        {
            this.parentAccessService = parentAccessService;
            this.studentRepository = studentRepository;
            this.feeDetailService = feeDetailService;
        }

        public async Task<PagedResponse<FeeDetailResponse>> GetChildFees(Guid parentUserId, Guid studentId, MyFeeDetailFilterRequest request)
        {
            var studentUserId = await ResolveStudentUserId(parentUserId, studentId);
            return await feeDetailService.GetAllMyFeeForStudent(request, studentUserId);
        }

        // Kiểm tra quyền sở hữu rồi trả về userId của học sinh để tái dùng các service của Student
        private async Task<Guid> ResolveStudentUserId(Guid parentUserId, Guid studentId)
        {
            await parentAccessService.EnsureParentOwnsStudent(parentUserId, studentId);

            var studentUserId = await studentRepository.GetUserIdByStudentId(studentId);
            if (studentUserId == Guid.Empty) throw new NotFoundException("Học sinh không tồn tại");
            return studentUserId;
        }
    }
}
