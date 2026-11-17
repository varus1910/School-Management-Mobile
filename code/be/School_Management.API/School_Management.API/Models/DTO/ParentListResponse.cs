namespace School_Management.API.Models.DTO
{
    public class ParentListResponse
    {
        public Guid ParentId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public int ChildrenCount { get; set; }
    }
}
