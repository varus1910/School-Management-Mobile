using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/parents")]
    [ApiController]
    public class ParentsController : ControllerBase
    {
        private readonly IParentService parentService;
        private readonly IParentChildService parentChildService;

        public ParentsController(IParentService parentService, IParentChildService parentChildService)
        {
            this.parentService = parentService;
            this.parentChildService = parentChildService;
        }

        // ---------------- Admin ----------------

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllParents([FromQuery] ParentFilterRequest request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await parentService.GetAllParents(request);
            return Ok(result);
        }

        [HttpGet]
        [Route("{parentId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetParentById([FromRoute] Guid parentId)
        {
            var result = await parentService.GetParentById(parentId);
            return Ok(result);
        }

        [HttpPost]
        [Route("{parentId:guid}/children")]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> LinkChild([FromRoute] Guid parentId, [FromBody] LinkChildRequest request)
        {
            var result = await parentService.LinkChild(parentId, request);
            return Ok(result);
        }

        [HttpDelete]
        [Route("{parentId:guid}/children/{studentId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnlinkChild([FromRoute] Guid parentId, [FromRoute] Guid studentId)
        {
            await parentService.UnlinkChild(parentId, studentId);
            return Ok(new
            {
                success = true,
                message = "Gỡ liên kết học sinh thành công"
            });
        }

        // ---------------- Parent ----------------

        [HttpGet]
        [Route("me")]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetMyProfile()
        {
            if (!TryGetUserId(out var userId)) return InvalidSession();

            var result = await parentService.GetMyProfile(userId);
            return Ok(result);
        }

        [HttpPatch]
        [Route("me")]
        [ValidateModel]
        [Authorize(Roles = "Parent")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateMyProfile([FromForm] UpdateAdminRequest request)
        {
            if (!TryGetUserId(out var userId)) return InvalidSession();

            var result = await parentService.UpdateMyProfile(request, userId);
            return Ok(result);
        }

        [HttpGet]
        [Route("me/children")]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetMyChildren()
        {
            if (!TryGetUserId(out var userId)) return InvalidSession();

            var result = await parentService.GetMyChildren(userId);
            return Ok(result);
        }

        [HttpGet]
        [Route("children/{studentId:guid}/fees")]
        [ValidateModel]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetChildFees([FromRoute] Guid studentId, [FromQuery] MyFeeDetailFilterRequest request)
        {
            if (!TryGetUserId(out var userId)) return InvalidSession();
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;

            var result = await parentChildService.GetChildFees(userId, studentId, request);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpGet]
        [Route("children/{studentId:guid}/results")]
        [ValidateModel]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetChildResults([FromRoute] Guid studentId, [FromQuery] ResultOfStudentRequest request)
        {
            if (!TryGetUserId(out var userId)) return InvalidSession();

            var result = await parentChildService.GetChildResults(userId, studentId, request);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpGet]
        [Route("children/{studentId:guid}/attendance")]
        [ValidateModel]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetChildAttendance([FromRoute] Guid studentId, [FromQuery] StudentAttedanceRequest request)
        {
            if (!TryGetUserId(out var userId)) return InvalidSession();

            var result = await parentChildService.GetChildAttendance(userId, studentId, request);
            return Ok(result);
        }

        private bool TryGetUserId(out Guid userId)
        {
            return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
        }

        private IActionResult InvalidSession()
        {
            return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
        }
    }
}
