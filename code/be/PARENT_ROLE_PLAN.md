# Kế hoạch role Phụ huynh (`Parent`) — bản nhẹ đã chốt

Làm backend và mobile (`code/fe`) song song, bám đúng pattern hiện tại:
Domain → EntityConfiguration → Repository (I + impl) → Service (I + impl) → Controller → DTO, đăng ký DI trong `Program.cs`.
Giao diện mobile bám theo `app/student/*`.

## Phạm vi đã chốt
Parent là **role phụ**, chủ yếu để xem. Làm gọn, không nặng như Student/Teacher/Admin.

| Có | Chưa làm (để sau) |
|---|---|
| Admin tạo user Parent (chọn role **Parent** ở màn tạo tài khoản), gắn/gỡ con | Phụ huynh **thanh toán** học phí |
| Phụ huynh xem hồ sơ, danh sách con | Chat realtime user-to-user (backend không chặn role, bật lại khi cần) |
| Xem của con: **học phí**, kết quả, điểm danh, thời khoá biểu, lịch thi | Bài tập / bài nộp |
| **AI chat** hỏi thông tin cơ bản về con (`ParentPlugin`, tái dùng logic `StudentPlugin`) | |

## 1. Backend

### 1.1 Dữ liệu
- `Parent`: `Id`, `UserId` (1-1 với `AppUser`, unique index như `Student`).
- `ParentStudent`: `ParentStudentId`, `ParentId`, `StudentId`, `Relationship` (Father/Mother/Guardian); unique `(ParentId, StudentId)`. Kiểu giống `StudentClassYear`.
- Sửa: `AppUser` (+ `Parent?`), `Student` (+ `ICollection<ParentStudent>`), `ApplicationDbContext` (DbSet + seed role `Parent` bằng Guid cố định mới).
- `EntityConfigurations/ParentConfiguration.cs`, `ParentStudentConfiguration.cs`.
- 1 migration `AddParentRole` (kiểm tra chỉ có 2 bảng mới + seed role). **Chưa áp lên DB thật** cho đến khi user đồng ý / tạo branch Neon riêng.

### 1.2 Bảo mật
- `ParentAccessService`: `EnsureParentOwnsStudent(parentUserId, studentId)` ném `ForbiddenException` nếu không phải con. **Mọi endpoint Parent nhận `studentId` đều gọi trước.**
- Cách tái dùng: kiểm tra quyền → lấy `userId` học sinh bằng `IStudentRepository.GetUserIdByStudentId` (đã có) → gọi lại service cũ của Student.

### 1.3 API
**Admin**
- `POST api/users` (sửa `CreateUser`): hỗ trợ `Role = "Parent"` + `StudentIds`, `Relationship`.
- `POST api/parents/{parentId}/children`, `DELETE api/parents/{parentId}/children/{studentId}`.
- `GET api/parents` (danh sách, phân trang, lọc tên) để chọn khi gắn con.

**Parent** (`[Authorize(Roles = "Parent")]`)
- `GET api/parents/me`, `PATCH api/parents/me` (multipart, giống `students/me`)
- `GET api/parents/me/children`
- `GET api/parents/children/{studentId}/fees | results | attendance | timetable | exam-schedules`

**AI chat**: `AIChatbotRepository.ChatWithAI(request, userId, role)` chọn plugin theo role. Thêm `Repositories/ParentPlugin.cs` với các hàm học phí, kết quả, điểm danh, lịch học, lịch thi, sự kiện; mỗi hàm nhắm tới con đã chọn và kiểm tra quyền sở hữu. Mở `[Authorize]` của endpoint chat cho role Parent.

### 1.4 File
- Tạo: `Models/Domain/Parent.cs`, `ParentStudent.cs`; `EntityConfigurations/*`; `Repositories/IParentRepository|ParentRepository`; `Services/IParentService|ParentService`, `IParentAccessService|ParentAccessService`; `Controllers/ParentsController.cs`; DTO (`ParentInfoResponse`, `ParentListResponse`, `ChildInfoResponse`, `LinkChildRequest`, `ParentFilterRequest`).
- Sửa: `AppUser`, `Student`, `ApplicationDbContext`, `CreateUserRequest`, `UserService.CreateUser` (+ `UpdateRoleForUser`), `Program.cs` (DI).

## 2. Mobile (`code/fe`)
Chưa đọc chi tiết; trước khi làm sẽ đọc `app/index.tsx`, `login.tsx`, `(tabs)/profile.tsx`, `app/student/*`, `components/SideMenu.tsx`, `app/admin/users/create.tsx`.
- Điều hướng sau đăng nhập theo role `Parent` → `app/parent/`.
- `app/parent/`: trang chủ (chọn con), fees (chỉ xem), results, attendance, timetable, exam-schedule, notifications, ai-chat (sao chép từ `student/ai-chat`).
- `app/admin/users/create.tsx`: danh sách role lấy từ API nên `Parent` tự hiện sau khi seed, nhưng chỗ hiển thị nhãn theo tên role (đang có `Teacher`/`Student`) phải thêm `Parent`; thêm ô chọn con khi role là Parent. Kiểm tra thêm `admin/users/index.tsx`.

## 3. Thứ tự làm
1. Tạo nhánh `feature/parent-role`.
2. BE: entity, config, seed role, migration (chưa áp DB).
3. BE: `ParentAccessService`, tạo user Parent, API gắn/gỡ con, `GET api/parents`.
4. BE: API Parent (me, children, 5 mục dữ liệu của con).
5. Mobile: điều hướng role + màn tạo user có role Parent + các màn Parent + AI chat.
6. Áp migration lên **branch Neon riêng**, test cả luồng.
7. Merge vào `main` khi user đồng ý.

## 4. Test cần có
- Parent chưa gắn con / gọi `studentId` không phải con → `403`.
- Tạo user Parent kèm `StudentIds` → đủ `AppUser` + `Parent` + `ParentStudent`, đúng role.
- Gắn trùng một con → `409`.
- Token Parent không gọi được endpoint Admin/Teacher/Student và ngược lại.
- Học sinh bị khoá/xoá → phụ huynh không còn thấy dữ liệu.
