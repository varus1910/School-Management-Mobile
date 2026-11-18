using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using School_Management.API.Data;
using System.ComponentModel;

namespace School_Management.API.Repositories
{
    // Plugin AI cho phụ huynh: chỉ đọc dữ liệu của con. Tái dùng logic của StudentPlugin
    // sau khi xác định con nằm trong danh sách con của phụ huynh đang chat.
    public class ParentPlugin
    {
        private readonly string role;
        private readonly Guid userId;
        private readonly ApplicationDbContext context;
        private readonly IStudentRepository studentRepository;
        private readonly IScheduleRepository scheduleRepository;
        private readonly Kernel kernel;

        public ParentPlugin(string role, Guid userId, ApplicationDbContext context, IStudentRepository studentRepository, IScheduleRepository scheduleRepository, Kernel kernel)
        {
            this.role = role;
            this.userId = userId;
            this.context = context;
            this.studentRepository = studentRepository;
            this.scheduleRepository = scheduleRepository;
            this.kernel = kernel;
        }

        private sealed record ChildItem(Guid UserId, string? FullName);

        private async Task<List<ChildItem>> GetChildren()
        {
            return await context.ParentStudent.AsNoTracking()
                                .Where(x => x.Parent!.UserId == userId)
                                .OrderBy(x => x.Student!.User!.FullName)
                                .Select(x => new ChildItem(x.Student!.UserId, x.Student.User!.FullName))
                                .ToListAsync();
        }

        // Trả về plugin của học sinh (con) được chọn, hoặc thông báo để AI hỏi lại người dùng
        private async Task<(StudentPlugin? plugin, string? message)> ResolveChild(string? childName)
        {
            var children = await GetChildren();
            if (children.Count == 0)
                return (null, "Tài khoản này chưa được gắn với học sinh nào, vui lòng liên hệ nhà trường.");

            var selected = children;
            if (!string.IsNullOrWhiteSpace(childName))
            {
                selected = children.Where(x => x.FullName != null && x.FullName.Contains(childName.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
                if (selected.Count == 0)
                    return (null, $"Không tìm thấy con tên '{childName}'. Các con của phụ huynh: {string.Join(", ", children.Select(x => x.FullName))}.");
            }

            if (selected.Count > 1)
                return (null, $"Phụ huynh có nhiều con, hãy hỏi lại tên con muốn xem: {string.Join(", ", selected.Select(x => x.FullName))}.");

            return (new StudentPlugin("Student", selected[0].UserId, context, studentRepository, scheduleRepository, kernel), null);
        }

        [KernelFunction]
        [Description("Lấy danh sách các con (học sinh) của phụ huynh đang chat")]
        public async Task<object> GetMyChildren()
        {
            var children = await GetChildren();
            return children.Select(x => x.FullName).ToList();
        }

        [KernelFunction]
        [Description("Lấy thông tin cá nhân và lớp học của con")]
        public async Task<object> GetChildProfile(
            [Description("Tên con. Bỏ trống nếu phụ huynh chỉ có một con")] string? childName = null)
        {
            var (plugin, message) = await ResolveChild(childName);
            if (plugin == null) return message!;
            return await plugin.GetMyProfileForStudent();
        }

        [KernelFunction]
        [Description("Lấy danh sách học phí và lệ phí của con. Yêu cầu cung cấp năm học.")]
        public async Task<object> GetChildFees(
            [Description("Tên con. Bỏ trống nếu phụ huynh chỉ có một con")] string? childName = null,
            [Description("Năm học bắt đầu, nếu năm 2026-2027 thì lấy giá trị là 2026")] int? SchoolYear = null)
        {
            var (plugin, message) = await ResolveChild(childName);
            if (plugin == null) return message!;
            return await plugin.GetAllMyFeeForStudent(SchoolYear);
        }

        [KernelFunction]
        [Description("Lấy danh sách kết quả học tập của con, yêu cầu cung cấp năm học bắt đầu và học kì")]
        public async Task<object> GetChildResults(
            [Description("Tên con. Bỏ trống nếu phụ huynh chỉ có một con")] string? childName = null,
            [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")] int? Term = null,
            [Description("Năm học bắt đầu, nếu năm 2026-2027 thì lấy giá trị là 2026")] int? SchoolYear = null)
        {
            var (plugin, message) = await ResolveChild(childName);
            if (plugin == null) return message!;
            return await plugin.GetAllResultForStudent(Term, SchoolYear);
        }

        [KernelFunction]
        [Description("Lấy danh sách điểm danh của con trong một tháng của một năm, yêu cầu có tháng và năm")]
        public async Task<object> GetChildAttendance(
            [Description("Tên con. Bỏ trống nếu phụ huynh chỉ có một con")] string? childName = null,
            [Description("Tháng trong năm, ví dụ tháng 1, tháng 2..., bắt buộc phải có")] int? month = null,
            [Description("Năm, ví dụ 2025, 2026, bắt buộc phải có")] int? year = null)
        {
            var (plugin, message) = await ResolveChild(childName);
            if (plugin == null) return message!;
            return await plugin.GetStudentAttendance(month, year);
        }

        [KernelFunction]
        [Description("Lấy lịch học của con ở một học kì và năm học. Yêu cầu phải có năm học bắt đầu và kì học")]
        public async Task<object> GetChildSchedule(
            [Description("Tên con. Bỏ trống nếu phụ huynh chỉ có một con")] string? childName = null,
            [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")] int? Term = null,
            [Description("Năm học bắt đầu, nếu năm 2026-2027 thì lấy giá trị là 2026")] int? SchoolYear = null)
        {
            var (plugin, message) = await ResolveChild(childName);
            if (plugin == null) return message!;
            return await plugin.GetAllSchedule(Term, SchoolYear);
        }

        [KernelFunction]
        [Description("Lấy danh sách lịch thi của con. Yêu cầu đầy đủ loại lịch, học kỳ và năm học.")]
        public async Task<object> GetChildExamSchedule(
            [Description("Tên con. Bỏ trống nếu phụ huynh chỉ có một con")] string? childName = null,
            [Description("Loại lịch thi (Giữa kì hoặc Cuối kì). Bắt buộc phải có.")] string Type = "",
            [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")] int? Term = null,
            [Description("Năm học bắt đầu, nếu năm 2026-2027 thì lấy giá trị là 2026")] int? SchoolYear = null)
        {
            var (plugin, message) = await ResolveChild(childName);
            if (plugin == null) return message!;
            return await plugin.GetMyExamSchedule(Type, Term, SchoolYear);
        }

        [KernelFunction]
        [Description("Lấy thông tin sự kiện diễn ra ở trường, yêu cầu cung cấp năm học bắt đầu và kì học")]
        public async Task<object> GetAllEvent(
            [Description("Năm học bắt đầu, nếu năm 2026-2027 thì lấy giá trị là 2026")] int? SchoolYear = null,
            [Description("Học kì. Bắt buộc phải có")] int? Term = null,
            [Description("Tiêu đề sự kiện, nếu có giá trị thì là điều kiện lọc, không có thì lấy tất cả")] string? Title = null,
            [Description("Nội dung mô tả chi tiết sự kiện, là điều kiện lọc, không có lấy tất cả")] string? Body = null)
        {
            // Sự kiện của trường là thông tin chung, không phụ thuộc vào con
            var plugin = new StudentPlugin(role, userId, context, studentRepository, scheduleRepository, kernel);
            return await plugin.GetAllEvent(SchoolYear, Term, Title, Body);
        }
    }
}
