using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.Linq.Expressions;

namespace School_Management.API.Repositories
{
    public class ParentRepository : IParentRepository
    {
        private readonly ApplicationDbContext context;

        public ParentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<Guid?> GetParentIdByUserId(Guid userId)
        {
            return await context.Parent
                                .AsNoTracking()
                                .Where(x => x.UserId == userId)
                                .Select(x => (Guid?)x.Id)
                                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsParentOfStudent(Guid parentUserId, Guid studentId)
        {
            return await context.ParentStudent
                                .AsNoTracking()
                                .AnyAsync(x => x.StudentId == studentId && x.Parent!.UserId == parentUserId);
        }

        public async Task<PagedResponse<ParentListResponse>> GetAllParents(ParentFilterRequest request)
        {
            var query = context.Parent.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.FullName))
                query = query.Where(x => x.User!.FullName!.ToLower().Contains(request.FullName.ToLower()));

            var totalCount = await query.CountAsync();

            var items = await query.OrderBy(x => x.User!.FullName)
                                   .Skip((request.PageNumber - 1) * request.PageSize)
                                   .Take(request.PageSize)
                                   .Select(x => new ParentListResponse
                                   {
                                       ParentId = x.Id,
                                       UserId = x.UserId,
                                       FullName = x.User!.FullName,
                                       Email = x.User.Email,
                                       PhoneNumber = x.User.PhoneNumber,
                                       AvatarUrl = x.User.AvatarUrl,
                                       ChildrenCount = x.ParentStudents.Count
                                   }).ToListAsync();

            return new PagedResponse<ParentListResponse>
            {
                Items = items,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };
        }

        public async Task<(ParentInfoResponse? data, string message)> GetParentById(Guid parentId)
        {
            return await GetParentInfo(x => x.Id == parentId);
        }

        public async Task<(ParentInfoResponse? data, string message)> GetParentByUserId(Guid userId)
        {
            return await GetParentInfo(x => x.UserId == userId);
        }

        public async Task<(List<ChildInfoResponse>? data, string message)> GetChildrenByUserId(Guid userId)
        {
            var parentId = await GetParentIdByUserId(userId);
            if (parentId == null) return (null, "NOT_FOUND_PARENT");

            return (await GetChildrenByParentId(parentId.Value), "SUCCESS");
        }

        public async Task<(ChildInfoResponse? data, string message)> LinkChild(Guid parentId, LinkChildRequest request)
        {
            var isParentExisted = await context.Parent.AnyAsync(x => x.Id == parentId);
            if (!isParentExisted) return (null, "NOT_FOUND_PARENT");

            var isStudentExisted = await context.Student.AnyAsync(x => x.Id == request.StudentId);
            if (!isStudentExisted) return (null, "NOT_FOUND_STUDENT");

            var isLinked = await context.ParentStudent.AnyAsync(x => x.ParentId == parentId && x.StudentId == request.StudentId);
            if (isLinked) return (null, "CONFLICT_CHILD");

            context.ParentStudent.Add(new ParentStudent
            {
                ParentStudentId = Guid.NewGuid(),
                ParentId = parentId,
                StudentId = request.StudentId,
                Relationship = request.Relationship?.Trim()
            });
            await context.SaveChangesAsync();

            var children = await GetChildrenByParentId(parentId);
            return (children.First(x => x.StudentId == request.StudentId), "SUCCESS");
        }

        public async Task<(bool result, string message)> UnlinkChild(Guid parentId, Guid studentId)
        {
            var isParentExisted = await context.Parent.AnyAsync(x => x.Id == parentId);
            if (!isParentExisted) return (false, "NOT_FOUND_PARENT");

            var link = await context.ParentStudent.FirstOrDefaultAsync(x => x.ParentId == parentId && x.StudentId == studentId);
            if (link == null) return (false, "NOT_FOUND_LINK");

            context.ParentStudent.Remove(link);
            await context.SaveChangesAsync();
            return (true, "SUCCESS");
        }

        private async Task<(ParentInfoResponse? data, string message)> GetParentInfo(Expression<Func<Parent, bool>> predicate)
        {
            var parent = await context.Parent
                                      .AsNoTracking()
                                      .Where(predicate)
                                      .Select(x => new ParentInfoResponse
                                      {
                                          ParentId = x.Id,
                                          UserId = x.UserId,
                                          FullName = x.User!.FullName,
                                          Email = x.User.Email,
                                          PhoneNumber = x.User.PhoneNumber,
                                          Address = x.User.Address,
                                          AvatarUrl = x.User.AvatarUrl,
                                          Birthday = x.User.Birthday
                                      }).FirstOrDefaultAsync();
            if (parent == null) return (null, "NOT_FOUND_PARENT");

            parent.Children = await GetChildrenByParentId(parent.ParentId);
            return (parent, "SUCCESS");
        }

        private async Task<List<ChildInfoResponse>> GetChildrenByParentId(Guid parentId)
        {
            return await context.ParentStudent
                                .AsNoTracking()
                                .Where(x => x.ParentId == parentId)
                                .OrderBy(x => x.Student!.User!.FullName)
                                .Select(x => new ChildInfoResponse
                                {
                                    StudentId = x.StudentId,
                                    UserId = x.Student!.UserId,
                                    FullName = x.Student.User!.FullName,
                                    AvatarUrl = x.Student.User.AvatarUrl,
                                    Relationship = x.Relationship,
                                    ClassName = x.Student.StudentClassYears
                                                  .OrderByDescending(c => c.SchoolYear)
                                                  .Select(c => c.ClassYear!.ClassName)
                                                  .FirstOrDefault(),
                                    Grade = x.Student.StudentClassYears
                                                  .OrderByDescending(c => c.SchoolYear)
                                                  .Select(c => (int?)c.ClassYear!.Grade)
                                                  .FirstOrDefault(),
                                    SchoolYear = x.Student.StudentClassYears
                                                  .OrderByDescending(c => c.SchoolYear)
                                                  .Select(c => (int?)c.SchoolYear)
                                                  .FirstOrDefault()
                                }).ToListAsync();
        }
    }
}
