# School Management – Backend (.NET 8)

API quản lý trường học: ASP.NET Core 8 + EF Core (PostgreSQL/Neon, pgvector) + Identity + JWT.
Code nằm ở `School_Management.API/School_Management.API/`. Frontend mobile ở `../fe` (Expo/React Native).

## Lệnh thường dùng
Chạy trong `School_Management.API/` (thư mục chứa `.sln`):
- Build: `dotnet build`
- Chạy: `dotnet run --project School_Management.API`
- Migration (cần `dotnet-ef` 8.0.13): `dotnet ef migrations add <Ten> --project School_Management.API` rồi `dotnet ef database update --project School_Management.API`
- Chuỗi kết nối: `ConnectionStrings:NeonConnectionString` (appsettings / user-secrets). Không commit secret.

## Kiến trúc & quy ước (BẮT BUỘC bám theo)
Luồng: **Controller → Service (I + impl) → Repository (I + impl) → DbContext**. Mỗi feature có đủ từng lớp, tên theo mẫu `XxxController`, `IXxxService`/`XxxService`, `IXxxRepository`/`XxxRepository`.

- `Models/Domain/`: chỉ định nghĩa bảng (DataAnnotations `[Key]`, `[ForeignKey]`, navigation property). Cấu hình Fluent API đặt ở `EntityConfigurations/XxxConfiguration.cs`. Entity có soft delete thì kế thừa `BaseEntity` (`ISoftDelete`, global query filter trong `ApplicationDbContext`).
- `Models/DTO/`: request và response (`XxxRequest`, `XxxResponse`, `XxxFilterRequest`, `PagedResponse<T>`). Validation message bằng **tiếng Việt** qua DataAnnotations. Không trả domain entity ra API.
- **Repository**: chứa truy vấn EF, trả `(T? data, string message)` với message dạng `"SUCCESS"`, `"NOT_FOUND_XXX"`, `"CONFLICT_XXX"`. Dùng `AsNoTracking()` cho truy vấn đọc.
- **Service**: nhận `(data, message)` rồi `message switch { "NOT_FOUND_X" => throw new NotFoundException("..."), "SUCCESS" => data!, _ => throw new Exception("Lỗi không xác định") }`. Service cũ (Student/User) đôi khi dùng trực tiếp `ApplicationDbContext`/`UserManager`; code mới ưu tiên đi qua repository.
- **Controller**: mỏng. `[Route("api/xxx")] [ApiController]`, `[Authorize(Roles = "...")]`, `[ValidateModel]` (CustomActionFilter) cho body, lấy user từ `User.FindFirstValue(ClaimTypes.NameIdentifier)`, nếu null trả `Unauthorized(new { success=false, message="Phiên đăng nhập không hợp lệ hoặc đã hết hạn" })`. Upload dùng `[Consumes("multipart/form-data")]` + `[FromForm]`.
- Exception: dùng `Exceptions/` (`NotFoundException`, `ConflictException`, `BadRequestException`, `ForbiddenException`, `UnauthorizedException`); middleware xử lý chung, **không** try/catch trong controller.
- DI đăng ký thủ công trong `Program.cs` (`AddScoped<IXxxService, XxxService>()`). Thêm feature mới phải đăng ký ở đây.
- Thông báo lỗi và chuỗi hiển thị cho người dùng: **tiếng Việt**. Tên class/biến: tiếng Anh.
- Id dùng `Guid`. Thời gian dùng `DateTimeOffset`.

## Phân quyền
Role Identity: `Admin`, `Teacher`, `Student` (seed trong `Data/ApplicationDbContext.cs` bằng Guid cố định) và **`Parent` (đang thêm, xem `PARENT_ROLE_PLAN.md`)**.
- Role nằm trong JWT claim (`TokenService`), kiểm tra bằng `[Authorize(Roles = "...")]`.
- `AppUser` (Identity) liên kết 1-1 với `Student` / `Teacher` qua `UserId`; tạo user ở `UserService.CreateUser` (Admin tạo, không có tự đăng ký).
- Endpoint kiểu `/me`, `/my` lấy `userId` từ token rồi tra `StudentId`/`TeacherId`.
- Thêm role mới: seed role + migration + nhánh trong `CreateUser` + `[Authorize]` ở controller cần mở.
- Role Parent truy cập dữ liệu của con: **luôn kiểm tra quan hệ Parent–Student** trước khi trả dữ liệu (chống IDOR).

## Các thành phần khác
SignalR `PaymentHub` (thanh toán), `PaymentCleanUpService` (hosted service), Cloudinary (ảnh), Firebase (thông báo/chat), AI chatbot (Semantic Kernel + `AdminPlugin`/`StudentPlugin`/`TeacherPlugin` trong `Repositories/`), Serilog + OpenTelemetry (docker-compose ở thư mục gốc `be/`).

## Quy ước Git
- Mỗi tính năng làm trên **nhánh riêng** (vd `feature/parent-role`), xong mới merge vào `main`. Không commit thẳng vào `main`.
- Commit chỉ mang tên người dùng: **không** thêm `Co-Authored-By: Claude` hay dòng "Generated with Claude Code" vào commit/PR.
- **Chia nhỏ commit**: mỗi commit chỉ làm một đầu việc (vd: entity + config; migration; một API; một màn hình), không gộp nhiều việc vào một commit.
- Không tự push/merge khi chưa được yêu cầu. Message commit dạng `feat: ...`, `fix: ...` như lịch sử hiện có.

## Lưu ý
- `appsettings.Development.json` (gitignore) trỏ vào **DB Neon thật**; khởi động API tự chạy `MigrateAsync()` và `PaymentCleanUpService` xoá payment "Chưa đóng" quá 10 phút. Thử nghiệm migration nên dùng branch Neon riêng.
- Máy dev đã tắt Smart App Control để chạy `dotnet run`.
- Build hiện có ~500 warning nullable, bình thường; chỉ quan tâm error.
- Không refactor ngoài phạm vi yêu cầu; giữ nguyên style file xung quanh.
- Kế hoạch role Parent: `PARENT_ROLE_PLAN.md`.
