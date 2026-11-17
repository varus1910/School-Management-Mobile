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

        public ParentsController(IParentService parentService)
        {
            this.parentService = parentService;
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
    }
}
