using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;
using System.Security.Claims;

namespace School_Management.API.Services
{
    public class ParentChildService : IParentChildService
    {
        private readonly IParentAccessService parentAccessService;
        private readonly IStudentRepository studentRepository;
        private readonly IFeeDetailService feeDetailService;
        private readonly IResultService resultService;
        private readonly IAttendanceService attendanceService;
        private readonly IScheduleService scheduleService;
        private readonly IExamScheduleService examScheduleService;

        public ParentChildService(IParentAccessService parentAccessService, IStudentRepository studentRepository, IFeeDetailService feeDetailService, IResultService resultService, IAttendanceService attendanceService, IScheduleService scheduleService, IExamScheduleService examScheduleService)
        {
            this.parentAccessService = parentAccessService;
            this.studentRepository = studentRepository;
            this.feeDetailService = feeDetailService;
            this.resultService = resultService;
            this.attendanceService = attendanceService;
            this.scheduleService = scheduleService;
            this.examScheduleService = examScheduleService;
        }

        public async Task<PagedResponse<FeeDetailResponse>> GetChildFees(Guid parentUserId, Guid studentId, MyFeeDetailFilterRequest request)
        {
            var studentUserId = await ResolveStudentUserId(parentUserId, studentId);
            return await feeDetailService.GetAllMyFeeForStudent(request, studentUserId);
        }

        public async Task<ResultForStudentResponse> GetChildResults(Guid parentUserId, Guid studentId, ResultOfStudentRequest request)
        {
            var studentUserId = await ResolveStudentUserId(parentUserId, studentId);
            return await resultService.GetMyResultForStudent(request, studentUserId);
        }

        public async Task<StudentAttendanceResponse> GetChildAttendance(Guid parentUserId, Guid studentId, StudentAttedanceRequest request)
        {
            var studentUserId = await ResolveStudentUserId(parentUserId, studentId);
            return await attendanceService.GetStudentAttendance(request, studentUserId);
        }

        public async Task<List<ScheduleDetailResponse>> GetChildSchedule(Guid parentUserId, Guid studentId, ScheduleDetailIsActiveRequest request)
        {
            var studentUserId = await ResolveStudentUserId(parentUserId, studentId);
            return await scheduleService.GetMyScheduleForStudent(request, studentUserId);
        }

        public async Task<List<MyExamScheduleDetailResponse>> GetChildExamSchedule(Guid parentUserId, Guid studentId, MyExamScheduleDetailRequest request)
        {
            var studentUserId = await ResolveStudentUserId(parentUserId, studentId);

            // GetMyExamSchedule đọc userId và role từ ClaimsPrincipal. Tạo principal chỉ mang userId
            // của học sinh (không có role Teacher) để nó đi vào nhánh dành cho học sinh.
            var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, studentUserId.ToString()) });
            return await examScheduleService.GetMyExamSchedule(request, new ClaimsPrincipal(identity));
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
